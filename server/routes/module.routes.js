// server/routes/module.routes.js
const express = require('express');
const router = express.Router();
const {
  getAllModules,
  getModuleById,
  getTopicsByModule,
  getTopicById,
} = require('../controllers/module.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.get('/modules', getAllModules);
router.get('/modules/:moduleId', getModuleById);

// Protected routes
router.get('/modules/:moduleId/topics', protect, getTopicsByModule);
router.get('/topics/:topicId', protect, getTopicById);

module.exports = router;