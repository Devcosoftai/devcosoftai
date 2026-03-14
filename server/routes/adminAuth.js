const express = require('express');
const router = express.Router();
const {
  login, getMe, changePassword, seedAdmin,
} = require('../controllers/adminAuthController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', login);
router.post('/seed', seedAdmin); // Run once to create default admin

// Protected routes
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);

module.exports = router;
