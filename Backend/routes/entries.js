import { Router } from 'express';
import Entry from '../models/Entry.js';

const router = Router();

/* ── GET /api/entries ── 
   Fetch all diary entries, sorted by day ascending */
router.get('/', async (_req, res) => {
  try {
    const entries = await Entry.find().sort({ day: 1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/entries/:id ──
   Fetch a single entry by ID */
router.get('/:id', async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/entries ──
   Create a single new entry */
router.post('/', async (req, res) => {
  try {
    const entry = await Entry.create(req.body);
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ── PUT /api/entries/bulk ──
   Replace all entries with the submitted array.
   This is the primary save action from the Director Console —
   it deletes entries that no longer exist and upserts the rest. */
router.put('/bulk', async (req, res) => {
  try {
    const incoming = req.body; // Array of entry objects

    if (!Array.isArray(incoming) || incoming.length === 0) {
      return res.status(400).json({ error: 'Expected a non-empty array of entries' });
    }

    // Collect IDs of entries that already exist in the DB
    const existingIds = incoming
      .filter((e) => e._id)
      .map((e) => e._id);

    // Delete any entries NOT in the incoming set
    await Entry.deleteMany({ _id: { $nin: existingIds } });

    // Upsert each entry
    const saved = [];
    for (const item of incoming) {
      if (item._id) {
        // Update existing
        const updated = await Entry.findByIdAndUpdate(
          item._id,
          { $set: item },
          { new: true, runValidators: true }
        );
        if (updated) saved.push(updated);
      } else {
        // Create new
        const created = await Entry.create(item);
        saved.push(created);
      }
    }

    // Return sorted
    saved.sort((a, b) => a.day - b.day);
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ── PUT /api/entries/:id ──
   Update a single entry */
router.put('/:id', async (req, res) => {
  try {
    const entry = await Entry.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ── DELETE /api/entries/:id ──
   Delete a single entry */
router.delete('/:id', async (req, res) => {
  try {
    const entry = await Entry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
