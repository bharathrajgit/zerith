// server/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  resetFirstPassword,
  getInstitutionRegistrationOptions,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/institution-lookup/:institutionCode', getInstitutionRegistrationOptions);
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/reset-first-password', protect, resetFirstPassword);

module.exports = router;
