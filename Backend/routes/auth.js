import { Router } from 'express';
import crypto from 'crypto';
import User from '../models/User.js';

const router = Router();

// Helper to hash password using Node's native crypto
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/* ── POST /api/auth/register ── */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, adminCode } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate admin code if trying to register as admin
    if (role === 'admin' && adminCode !== 'lucy') {
      return res.status(400).json({ error: 'Invalid admin registration code' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const hashedPassword = hashPassword(password);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
      unlockedEntries: [],
    });

    // Return user details (omit password)
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      unlockedEntries: user.unlockedEntries,
      selfies: user.selfies || [],
      selfieCount: user.selfieCount || 0,
    };

    res.status(201).json(userResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/auth/login ── */
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = hashPassword(password);
    const user = await User.findOne({
      $and: [
        { $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }] },
        { password: hashedPassword }
      ]
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      unlockedEntries: user.unlockedEntries,
      selfies: user.selfies || [],
      selfieCount: user.selfieCount || 0,
    };

    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/auth/sync-unlocked ── */
router.post('/sync-unlocked', async (req, res) => {
  try {
    const { userId, unlockedEntries } = req.body;

    if (!userId || !Array.isArray(unlockedEntries)) {
      return res.status(400).json({ error: 'Invalid synchronization request' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Merge existing unlocked entries with the incoming ones to prevent loss of progress
    const merged = [...new Set([...user.unlockedEntries, ...unlockedEntries])];
    user.unlockedEntries = merged;
    await user.save();

    res.json({ unlockedEntries: user.unlockedEntries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/auth/sync-selfies ── */
router.post('/sync-selfies', async (req, res) => {
  try {
    const { userId, selfies } = req.body;

    if (!userId || !Array.isArray(selfies)) {
      return res.status(400).json({ error: 'Invalid selfies sync request' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.selfies = selfies;
    user.selfieCount = selfies.length;
    await user.save();

    res.json({ selfies: user.selfies, selfieCount: user.selfieCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
