const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User');

const router = express.Router();

router.use(protect);

router.post('/watched', async (req, res, next) => {
  try {
    const videoId = String(req.body?.videoId || '').trim();
    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'videoId is required',
      });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { watchedVideos: videoId } },
      { new: true }
    );

    const user = await User.findById(req.user._id).select('watchedVideos');
    return res.status(200).json({
      success: true,
      data: { watchedVideos: user?.watchedVideos || [] },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/watched', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('watchedVideos');
    res.status(200).json({
      success: true,
      data: { watchedVideos: user?.watchedVideos || [] },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
