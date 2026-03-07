const express = require('express');
const router = express.Router();
const { submitContact, getContacts } = require('../controllers/contactController');
const { validateContact } = require('../middleware/validateContact');
const rateLimit = require('express-rate-limit');

// Stricter rate limit for contact form
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 12,
  message: { error: 'Too many contact requests. Please try again in an hour.' },
});

// POST /api/contact
router.post('/', contactLimiter, validateContact, submitContact);

// GET /api/contact (admin)
router.get('/', getContacts);

module.exports = router;
