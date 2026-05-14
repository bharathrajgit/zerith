const User = require('../models/User');
const Topic = require('../models/Topic');
const {
  generateRoadmap,
  isLegacyRoadmap,
  markVideoCompleted,
  syncRoadmapForUser,
} = require('../services/roadmapGenerator');
const { logActivity } = require('../services/streakService');

const generateRoadmapHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      roadmap,
      recapModules = [],
    } = await generateRoadmap(user._id, user.currentLevel || 'Beginner');

    res.status(201).json({
      success: true,
      data: { roadmap, recapModules },
      message: 'Roadmap generated successfully',
    });
  } catch (err) {
    next(err);
  }
};

const getRoadmap = async (req, res, next) => {
  try {
    let user = await User.findById(req.user._id).populate('activeRoadmap');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.activeRoadmap) {
      await generateRoadmap(user._id, user.currentLevel || 'Beginner');
      user = await User.findById(req.user._id).populate('activeRoadmap');
    }

    let roadmap = user.activeRoadmap;
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'No active roadmap found',
      });
    }

    const hasBrokenWeeks =
      !Array.isArray(roadmap.weeks) ||
      roadmap.weeks.length === 0 ||
      roadmap.weeks.some((week) => !Array.isArray(week.days)) ||
      isLegacyRoadmap(roadmap);

    if (hasBrokenWeeks) {
      await generateRoadmap(req.user._id, user.currentLevel || 'Beginner');
      user = await User.findById(req.user._id).populate('activeRoadmap');
      roadmap = user.activeRoadmap;
    }

    const synced = await syncRoadmapForUser(req.user._id);
    if (synced?.roadmap) {
      roadmap = synced.roadmap;
    }
    const recapModules = synced?.recapModules || [];

    const currentDay = roadmap.currentDay || 1;
    const currentWeekObj = roadmap.weeks.find((week) =>
      week.days.some((day) => day.dayNumber === currentDay)
    );
    const currentWeek = currentWeekObj?.weekNumber || 1;
    const todayTasks = currentWeekObj?.days.find(
      (day) => day.dayNumber === currentDay
    )?.tasks || [];

    res.status(200).json({
      success: true,
      data: {
        roadmap,
        currentWeek,
        currentDay,
        todayTasks,
        recapModules,
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateDayCompletion = async (req, res, next) => {
  try {
    const { topicId, taskType } = req.body;

    if (!topicId || !taskType) {
      return res.status(400).json({
        success: false,
        message: 'topicId and taskType are required',
      });
    }

    if (taskType !== 'video') {
      return res.status(400).json({
        success: false,
        message: 'Only video completion is supported from this endpoint',
      });
    }

    const synced = await markVideoCompleted(req.user._id, topicId);
    if (!synced?.roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found',
      });
    }

    const topic = await Topic.findById(topicId).select('title').lean();
    await logActivity(req.user._id, 1, 15, [topic?.title || 'Video Lesson']);

    res.status(200).json({
      success: true,
      data: { roadmap: synced.roadmap, recapModules: synced.recapModules || [] },
      message: 'Task completed',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateRoadmapHandler,
  getRoadmap,
  updateDayCompletion,
};
