const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Protect routes — verifies JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check admin still exists and is active
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin || !admin.active) {
      return res.status(401).json({
        success: false,
        error: 'Token is no longer valid.',
      });
    }

    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired. Please login again.' });
    }
    res.status(500).json({ success: false, error: 'Authentication error.' });
  }
};

/**
 * Restrict to superadmin only
 */
const superAdminOnly = (req, res, next) => {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      error: 'Access restricted to superadmin only.',
    });
  }
  next();
};

module.exports = { protect, superAdminOnly };
