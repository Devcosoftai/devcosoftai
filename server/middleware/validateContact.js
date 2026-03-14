const { body } = require('express-validator');

exports.validateContact = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name too long'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),

  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Company name too long'),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be 10–2000 characters'),
];
