import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const defaultUsername = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
    const defaultPassword = process.env.ADMIN_PASSWORD || 'ramesh';

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password.',
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    // 1. Look up user in database
    let user = await User.findOne({ username: cleanUsername });

    // If user doesn't exist yet but credentials match environment default admin
    if (!user && cleanUsername === defaultUsername && password === defaultPassword) {
      user = await User.create({
        username: defaultUsername,
        password: defaultPassword,
        name: 'R3 Group Administrator',
        email: 'admin@r3group.in',
        role: 'Super Admin',
        status: 'Active',
        isPrimaryAdmin: true,
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({
        success: false,
        message: 'This administrative account is suspended. Contact managing partner.',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    const secret = process.env.JWT_SECRET || 'r3_group_ultra_luxury_secret_key_2026';
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: 'admin',
        userRole: user.role,
        name: user.name,
      },
      secret,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Admin authentication successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        isPrimaryAdmin: user.isPrimaryAdmin,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/me', verifyAdmin, async (req, res) => {
  try {
    let user = null;
    if (req.user?.id) {
      user = await User.findById(req.user.id).select('-password');
    }
    if (!user && req.user?.username) {
      user = await User.findOne({ username: req.user.username }).select('-password');
    }

    res.json({
      success: true,
      user: user || {
        username: req.user.username,
        role: 'Super Admin',
        name: 'R3 Group Administrator',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
