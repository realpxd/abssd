const express = require('express');
const router = express.Router();
const {
  createContact,
  getAllContacts,
  getContact,
} = require('../controllers/contactController');

router.post('/', createContact);
router.get('/', getAllContacts);
router.get('/:id', getContact);

module.exports = router;
