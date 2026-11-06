import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users - List all admin users
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: 1 });
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/users - Create new admin user
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { name, username, password, email, role = 'Managing Partner', status = 'Active' } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, username, and initial password are required.',
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check if username already exists
    const existing = await User.findOne({ username: cleanUsername });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Username '${cleanUsername}' is already taken. Please choose another.`,
      });
    }

    const newUser = new User({
      name: name.trim(),
      username: cleanUsername,
      password: password,
      email: email ? email.trim().toLowerCase() : '',
      role,
      status,
      isPrimaryAdmin: false,
    });

    const saved = await newUser.save();
    const userObj = saved.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: `User '${cleanUsername}' created successfully.`,
      data: userObj,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/users/:id - Update user details & status
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status, newPassword } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) user.name = name.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (role) user.role = role;

    // Prevent suspending the primary admin
    if (user.isPrimaryAdmin && status === 'Suspended') {
      return res.status(400).json({
        success: false,
        message: 'The primary system admin account cannot be suspended.',
      });
    }
    if (status) user.status = status;

    // Update password if provided
    if (newPassword && newPassword.trim().length > 0) {
      user.password = newPassword.trim();
    }

    await user.save();
    const updated = user.toObject();
    delete updated.password;

    res.json({
      success: true,
      message: `User account '${user.username}' updated successfully.`,
      data: updated,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/users/:id - Delete an admin user
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.isPrimaryAdmin) {
      return res.status(403).json({
        success: false,
        message: 'The primary system admin account cannot be deleted.',
      });
    }

    if (user.username === req.user?.username?.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own logged-in account.',
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `User '${user.username}' has been removed from admin access.`,
      data: { id },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
