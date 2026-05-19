const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  startDiagnostic,
  getQuestion,
  submitAnswer,
  completeDiagnostic,
  getLatestDiagnosticSummary,
  openCodingProblem,
  submitCodingProblem,
  completeCodingPhase,
} = require('../controllers/diagnosticController');

const router = express.Router();

router.post('/start', protect, startDiagnostic);
router.post('/question', protect, getQuestion);
router.post('/answer', protect, submitAnswer);
router.get('/summary', protect, getLatestDiagnosticSummary);
router.post('/complete', protect, completeDiagnostic);
router.post('/coding/open', protect, openCodingProblem);
router.post('/coding/submit', protect, submitCodingProblem);
router.post('/coding/complete', protect, completeCodingPhase);

module.exports = router;
