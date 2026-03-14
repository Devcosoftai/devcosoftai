const Contact = require('../models/Contact');

/**
 * GET /api/admin/contacts
 * Get all contacts with pagination, filter, search
 */
exports.getAllContacts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      service,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (service) filter.service = service;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Contact.countDocuments(filter);
    const contacts = await Contact.find(filter)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Stats summary
    const stats = await Contact.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
      stats: stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch contacts.' });
  }
};

/**
 * GET /api/admin/contacts/:id
 */
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found.' });
    }
    res.json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch contact.' });
  }
};

/**
 * PATCH /api/admin/contacts/:id/status
 */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['new', 'read', 'replied', 'archived'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value.' });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found.' });
    }

    res.json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update status.' });
  }
};

/**
 * DELETE /api/admin/contacts/:id
 */
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found.' });
    }
    res.json({ success: true, message: 'Contact deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete contact.' });
  }
};

/**
 * GET /api/admin/contacts/export/csv
 */
exports.exportCSV = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    const headers = ['Name', 'Email', 'Company', 'Service', 'Budget', 'Message', 'Status', 'Date'];
    const rows = contacts.map((c) => [
      c.name, c.email, c.company || '', c.service || '',
      c.budget || '', `"${c.message.replace(/"/g, '""')}"`,
      c.status, new Date(c.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Export failed.' });
  }
};
