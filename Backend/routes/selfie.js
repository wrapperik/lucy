import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { VertexAI } from '@google-cloud/vertexai';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LUCY_REF_PATH = path.join(__dirname, '..', 'assets', 'lucy-reference.png');
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'service-account.json');

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
- Lucy stands naturally next to the user, like a friend taking a selfie together. Shoulders touching or arms around each other is fine.
- Match the lighting, color temperature, camera angle, depth of field, grain, and overall photographic quality of the user's selfie so the result looks like a single authentic photo.
- Keep the user's original background; add Lucy realistically into the same scene.
- Casual, candid, warm friendly mood. Slight smile or natural expression.
- Output a single photorealistic image, no text overlays, no watermarks, no borders.`;

function createVertexClient() {
  const project = process.env.GOOGLE_PROJECT_ID;
  const location = process.env.GOOGLE_LOCATION || 'us-central1';

  // Use service account JSON if present, otherwise fall back to
  // Application Default Credentials (gcloud auth / env var)
  const keyFile = SERVICE_ACCOUNT_PATH;

  return new VertexAI({ project, location, googleAuthOptions: { keyFile } });
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

    const vertexai = createVertexClient();
    const model = vertexai.getGenerativeModel({
      model: 'gemini-3-pro-image',
    });

    const request = {
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
      generationConfig: {
        responseModalities: ['IMAGE'],
      },
    };

    const result = await model.generateContent(request);
    const response = result.response;

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
