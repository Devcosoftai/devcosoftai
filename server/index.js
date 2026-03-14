const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');

const contactRoutes = require('./routes/contact');
const servicesRoutes = require('./routes/services');
const statsRoutes = require('./routes/stats');
const newsletterRoutes = require('./routes/newsletter');
const adminAuthRoutes = require('./routes/adminAuth');
const adminContactsRoutes = require('./routes/adminContacts');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' }
});

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'DevCoSoft.ai API running 🚀' }));

app.use('/api/contact', contactRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin/auth', loginLimiter, adminAuthRoutes);
app.use('/api/admin/contacts', adminContactsRoutes);

app.use((req, res) => res.status(404).json({ error: `Route ${req.originalUrl} not found` }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server: http://localhost:${PORT}`);
  console.log(`🔐 Seed admin: POST http://localhost:${PORT}/api/admin/auth/seed\n`);
});

module.exports = app;
