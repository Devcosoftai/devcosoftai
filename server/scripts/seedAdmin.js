/**
 * DevCoSoft.ai — Admin Seed Script
 * Run: node server/scripts/seedAdmin.js
 * Creates the default superadmin account
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await Admin.findOne({ email: 'admin@devcosoft.ai' });
    if (existing) {
      console.log('⚠️  Admin already exists: admin@devcosoft.ai');
      console.log('   To reset password, delete the admin doc and re-run this script.');
      process.exit(0);
    }

    await Admin.create({
      name: 'DevCoSoft Admin',
      email: 'admin@devcosoft.ai',
      password: 'Admin@123',
      role: 'superadmin',
    });

    console.log('\n🎉 Default admin created successfully!');
    console.log('─────────────────────────────────────');
    console.log('  URL:      http://localhost:3000/admin/login');
    console.log('  Email:    admin@devcosoft.ai');
    console.log('  Password: Admin@123');
    console.log('─────────────────────────────────────');
    console.log('⚠️  Change this password after first login!\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
