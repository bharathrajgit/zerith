// server/routes/roadmap.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  generateRoadmapHandler,
  getRoadmap,
  updateDayCompletion,
} = require('../controllers/roadmap.controller');

router.use(protect);

router.post('/generate', generateRoadmapHandler);
router.get('/', getRoadmap);
router.put('/complete-task', updateDayCompletion);

module.exports = router;