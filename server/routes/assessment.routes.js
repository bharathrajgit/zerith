// server/routes/assessment.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  submitAssessment,
  submitDiagnostic,
  getAssessmentHistory,
} = require('../controllers/assessment.controller');

router.use(protect);

router.post('/submit', submitAssessment);
router.post('/diagnostic', submitDiagnostic);
router.get('/history', getAssessmentHistory);

module.exports = router;