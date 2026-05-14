// server/routes/progress.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getUserProgress,
  getTopicProgress,
  updateTopicUnlock,
  completeCodingAndUnlock,
} = require('../controllers/progress.controller');

router.use(protect);

// Static routes first
router.get('/', getUserProgress);
router.post('/unlock', updateTopicUnlock);   // ← specific path before :topicId
router.post('/coding-complete', completeCodingAndUnlock);

// Parameterised route last
router.get('/:topicId', getTopicProgress);

module.exports = router;