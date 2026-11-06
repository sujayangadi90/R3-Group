import express from 'express';
import jwt from 'jsonwebtoken';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'ramesh';

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both username and password',
    });
  }

  // Exact or trimmed match
  if (
    username.trim().toLowerCase() === validUsername.toLowerCase() &&
    password === validPassword
  ) {
    const secret = process.env.JWT_SECRET || 'r3_group_ultra_luxury_secret_key_2026';
    const token = jwt.sign(
      {
        username: validUsername,
        role: 'admin',
      },
      secret,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Admin authentication successful',
      token,
      user: {
        username: validUsername,
        role: 'admin',
        name: 'R3 Group Administrator',
      },
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid credentials. Please verify your username and password.',
  });
});

router.get('/me', verifyAdmin, (req, res) => {
  res.json({
    success: true,
    user: {
      username: req.user.username,
      role: 'admin',
      name: 'R3 Group Administrator',
    },
  });
});

export default router;
