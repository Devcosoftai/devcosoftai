const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Generate JWT token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });

/**
 * POST /api/admin/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.',
      });
    }

    // Find admin and include password
    const admin = await Admin.findOne({ email, active: true }).select('+password');

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = generateToken(admin._id);

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed.' });
  }
};

/**
 * GET /api/admin/auth/me
 */
exports.getMe = async (req, res) => {
  res.json({ success: true, admin: req.admin });
};

/**
 * POST /api/admin/auth/change-password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Both passwords are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters.' });
    }

    const admin = await Admin.findById(req.admin._id).select('+password');
    if (!(await admin.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect.' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to change password.' });
  }
};

/**
 * POST /api/admin/auth/seed
 * Creates default superadmin (run once in development)
 */
exports.seedAdmin = async (req, res) => {
  try {
    const exists = await Admin.findOne({ email: 'admin@devcosoft.ai' });
    if (exists) {
      return res.json({ success: false, message: 'Admin already exists.' });
    }

    await Admin.create({
      name: 'DevCoSoft Admin',
      email: 'admin@devcosoft.ai',
      password: 'Admin@123',
      role: 'superadmin',
    });

    res.status(201).json({
      success: true,
      message: 'Default admin created.',
      credentials: { email: 'admin@devcosoft.ai', password: 'Admin@123' },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
