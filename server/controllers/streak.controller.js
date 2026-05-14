// server/controllers/streak.controller.js
const { logActivity, getStreakData } = require('../services/streakService');

// @desc    Log a daily streak activity
// @route   POST /api/streak/log
// @access  Private
const logStreak = async (req, res, next) => {
  try {
    const { tasksCompleted = 0, minutesSpent = 0, topicsStudied = [] } = req.body;

    const result = await logActivity(
      req.user._id,
      tasksCompleted,
      minutesSpent,
      topicsStudied
    );

    res.status(200).json({
      success: true,
      data: result,
      message: result.isNewRecord ? 'New streak record achieved!' : 'Streak logged',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get streak data for the logged-in user
// @route   GET /api/streak
// @access  Private
const getStreak = async (req, res, next) => {
  try {
    const data = await getStreakData(req.user._id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { logStreak, getStreak };