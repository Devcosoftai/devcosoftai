const express = require('express');
const router = express.Router();
const {
  getAllContacts,
  getContactById,
  updateStatus,
  deleteContact,
  exportCSV,
} = require('../controllers/adminContactsController');
const { protect } = require('../middleware/authMiddleware');

// All routes protected with JWT
router.use(protect);

router.get('/', getAllContacts);
router.get('/export/csv', exportCSV);
router.get('/:id', getContactById);
router.patch('/:id/status', updateStatus);
router.delete('/:id', deleteContact);

module.exports = router;
