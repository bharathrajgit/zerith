const express = require('express');
const router = express.Router();
const {
  registerInstitution,
  loginInstitution,
  getInstitutionProfile,
} = require('../controllers/institution.auth.controller');
const { protectInstitution } = require('../middleware/institution.middleware');

router.post('/register', registerInstitution);
router.post('/login', loginInstitution);
router.get('/profile', protectInstitution, getInstitutionProfile);

module.exports = router;