import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import vision from '@google-cloud/vision';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LUCY_REF_PATH = path.join(__dirname, '..', 'assets', 'lucy-reference.png');
const SERVICE_ACCOUNT_PATH =
  process.env.SERVICE_ACCOUNT_PATH || path.join(__dirname, '..', 'service-account.json');

let lucyRefCache = null;
async function getLucyReference() {
  if (lucyRefCache) return lucyRefCache;
  const buf = await fs.readFile(LUCY_REF_PATH);
  lucyRefCache = buf.toString('base64');
  return lucyRefCache;
}

const PROMPT = `Create a hyper-realistic photograph showing the person from the FIRST image and the young woman from the SECOND image (named Lucy) standing side-by-side as close friends.

Requirements:
- Preserve the exact facial features, hair, skin tone, and outfit of BOTH people from their reference photos. Do not alter identities.
- Lucy must wear exactly the outfit shown in her reference photo. Do not adapt, change, or contextualise her clothing to match the user's setting, activity, or attire under any circumstances.
- Lucy stands naturally next to the user, like a friend taking a selfie together. Shoulders touching or arms around each other is fine.
- Match the lighting, color temperature, camera angle, depth of field, grain, and overall photographic quality of the user's selfie so the result looks like a single authentic photo.
- Keep the user's original background; add Lucy realistically into the same scene.
- Casual, candid, warm friendly mood. Slight smile or natural expression.
- Output a single photorealistic image, no text overlays, no watermarks, no borders.`;

function createGenAIClient() {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = SERVICE_ACCOUNT_PATH;

  return new GoogleGenAI({
    vertexai: true,
    project: process.env.GOOGLE_PROJECT_ID,
    location: 'global',
  });
}

const visionClient = new vision.ImageAnnotatorClient({ keyFilename: SERVICE_ACCOUNT_PATH });
const EXPLICIT_LIKELIHOODS = new Set(['LIKELY', 'VERY_LIKELY']);

async function isSafeImage(base64Data) {
  const [result] = await visionClient.safeSearchDetection({
    image: { content: base64Data },
  });
  const s = result.safeSearchAnnotation;
  console.log('SafeSearch:', { adult: s.adult, violence: s.violence, racy: s.racy });
  return !EXPLICIT_LIKELIHOODS.has(s.adult) && !EXPLICIT_LIKELIHOODS.has(s.violence);
}

/* ── POST /api/selfie/compose ──
   Body: { image: "data:image/jpeg;base64,..." }
   Returns: { image: "data:image/png;base64,..." } */
router.post('/compose', async (req, res) => {
  try {
    const { image } = req.body || {};
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Missing image data.' });
    }

    const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: 'Image must be a base64 data URL.' });
    }
    const userMime = match[1];
    const userB64 = match[2];

    const lucyB64 = await getLucyReference();

    const safe = await isSafeImage(userB64);
    if (!safe) {
      return res.status(400).json({ error: 'Image contains inappropriate content.' });
    }

    const ai = createGenAIClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image',
      contents: [
        {
          role: 'user',
          parts: [
            { text: PROMPT },
            { inlineData: { mimeType: userMime, data: userB64 } },
            { inlineData: { mimeType: 'image/png', data: lucyB64 } },
          ],
        },
      ],
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData?.data
    );

    if (!imagePart) {
      const textPart = response.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
      return res.status(502).json({
        error: 'Gemini did not return an image.',
        detail: textPart || 'Empty response.',
      });
    }

    const outMime = imagePart.inlineData.mimeType || 'image/png';
    const outData = imagePart.inlineData.data;
    res.json({ image: `data:${outMime};base64,${outData}` });
  } catch (err) {
    console.error('Selfie compose error:', err);
    res.status(500).json({ error: err.message || 'Selfie generation failed.' });
  }
});

export default router;
