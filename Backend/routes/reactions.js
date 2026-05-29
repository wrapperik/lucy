import { Router } from 'express';
import Reaction from '../models/Reaction.js';

const router = Router();

/* ── Helper: build counts + userReactions for an entry ── */
async function getReactionData(entryId, userId) {
  const reactions = await Reaction.find({ entryId });

  const counts = {};
  const userReactions = [];

  for (const r of reactions) {
    counts[r.emoji] = (counts[r.emoji] || 0) + 1;
    if (userId && r.userId === userId) {
      userReactions.push(r.emoji);
    }
  }

  return { counts, userReactions };
}

/* ── GET /api/reactions/:entryId ──
   Get reaction counts for an entry.
   Optional query param ?userId= to include which emojis the user reacted with. */
router.get('/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    const { userId } = req.query;
    const data = await getReactionData(entryId, userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/reactions ──
   Toggle a reaction. If it exists, remove it; otherwise create it. */
router.post('/', async (req, res) => {
  try {
    const { entryId, userId, emoji } = req.body;

    if (!entryId || !userId || !emoji) {
      return res.status(400).json({ error: 'entryId, userId, and emoji are required' });
    }

    const existing = await Reaction.findOne({ entryId, userId, emoji });

    if (existing) {
      await existing.deleteOne();
    } else {
      await Reaction.create({ entryId, userId, emoji });
    }

    const data = await getReactionData(entryId, userId);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
