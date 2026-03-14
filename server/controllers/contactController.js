const { validationResult } = require('express-validator');
const Contact = require('../models/Contact');

/**
 * POST /api/contact
 * Submit a new contact form entry
 */
exports.submitContact = async (req, res) => {
  try {
    const { name, email, company, service, budget, message } = req.body;

    // Validate inputs
    const errors = validationResult({ name, email, company, service, budget });
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contact = await Contact.create({
      name,
      email,
      company,
      service,
      budget,
      message,
      ipAddress: req.ip,
    });

    // TODO: Send notification email (nodemailer) — see config/mailer.js

    res.status(201).json({
      success: true,
      message: 'Thank you! We will get back to you within 24 hours.',
      id: contact._id,
    });
  } catch (error) {
    console.error('Contact submit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit contact form. Please try again.',
    });
  }
};

/**
 * GET /api/contact
 * Get all contacts (admin use)
 */
exports.getContacts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      data: contacts,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};
