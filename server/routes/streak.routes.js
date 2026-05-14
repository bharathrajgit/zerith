// server/routes/streak.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { logStreak, getStreak } = require('../controllers/streak.controller');

router.use(protect);

router.post('/log', logStreak);
router.get('/', getStreak);

module.exports = router;