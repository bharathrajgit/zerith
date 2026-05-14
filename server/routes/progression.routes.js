const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { buildProgressionForUser } = require('../services/progressionService');

const router = express.Router();

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const progression = await buildProgressionForUser(req.user);
    res.status(200).json({
      success: true,
      data: progression,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
