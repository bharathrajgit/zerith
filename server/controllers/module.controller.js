// server/controllers/module.controller.js
const Module = require('../models/Module');
const Topic = require('../models/Topic');
const Progress = require('../models/Progress');
const {
  buildProgressionForUser,
  getTopicProgressionState,
} = require('../services/progressionService');

// @desc    Get all active modules
// @route   GET /api/modules
// @access  Public
const getAllModules = async (req, res, next) => {
  try {
    const modules = await Module.find({ isActive: true })
      .sort({ order: 1 })
      .select('title description order icon totalTopics difficulty estimatedDays');

    res.status(200).json({
      success: true,
      count: modules.length,
      data: modules,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single module by ID (with topics)
// @route   GET /api/modules/:moduleId
// @access  Public
const getModuleById = async (req, res, next) => {
  try {
    console.log('Looking for module with ID:', req.params.moduleId);
    const { ObjectId } = require('mongoose').Types;
    
    let module = null;
    
    // Check if the ID is a valid ObjectId format (24 hex characters)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    const isValidObjectId = objectIdRegex.test(req.params.moduleId);
    
    if (isValidObjectId) {
      console.log('Searching by ObjectId');
      module = await Module.findById(req.params.moduleId);
      if (module) {
        const Topic = require('../models/Topic');
        const topics = await Topic.find({ moduleId: module._id }).sort({ order: 1 });
        module.topics = topics;
        console.log('Module found by ObjectId:', module.title);
        console.log('Topics count:', topics.length);
      }
    } else if (!isNaN(req.params.moduleId)) {
      console.log('Searching by order:', parseInt(req.params.moduleId));
      module = await Module.findOne({ order: parseInt(req.params.moduleId) });
      if (module) {
        const Topic = require('../models/Topic');
        const topics = await Topic.find({ moduleId: module._id }).sort({ order: 1 });
        module.topics = topics;
        console.log('Module found by order:', module.title);
        console.log('Topics count:', topics.length);
      }
    }

    if (!module) {
      console.log('Module not found. Available modules:');
      const allModules = await Module.find({}, 'title order _id');
      console.log(allModules.map(m => ({ id: m._id, title: m.title, order: m.order })));
      
      return res.status(404).json({
        success: false,
        message: 'Module not found',
      });
    }

    console.log('Found module:', module?.title, 'with', module.topics?.length || 0, 'topics');
    const moduleObj = module ? module.toObject() : null;
    if (moduleObj) {
      moduleObj.topics = module.topics || [];
    }
    res.status(200).json({
      success: true,
      data: {
        module: moduleObj
      },
    });
  } catch (err) {
    console.error('Error in getModuleById:', err);
    next(err);
  }
};

// @desc    Get topics by module (with user progress if logged in)
// @route   GET /api/modules/:moduleId/topics
// @access  Private
const getTopicsByModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    // Fetch topics for the module
    const topics = await Topic.find({ moduleId }).sort({ order: 1 });

    // If user is authenticated, fetch their progress for these topics
    let progressMap = {};
    let progressionTopicState = new Map();
    if (req.user) {
      const topicIds = topics.map((t) => t._id);
      const progressDocs = await Progress.find({
        userId: req.user._id,
        topicId: { $in: topicIds },
      });

      // Map topicId -> progress doc for quick lookup
      progressDocs.forEach((p) => {
        progressMap[p.topicId.toString()] = p;
      });

      // Derive unlock state from progression rules (foundation + sequential module unlock).
      const progression = await buildProgressionForUser(req.user);
      const targetModule = (progression.modules || []).find(
        (mod) => String(mod._id) === String(moduleId)
      );
      if (targetModule) {
        (targetModule.topics || []).forEach((topic) => {
          progressionTopicState.set(String(topic._id), {
            accessible: !!topic.accessible,
            unlocked: !!topic.unlocked,
            completed: !!topic.completed,
            status: topic.status || 'Locked',
          });
        });
      }
    }

    // Attach progress to each topic
    const topicsWithProgress = topics.map((topic) => {
      const topicObj = topic.toObject();
      const existingProgress = progressMap[topic._id.toString()] || null;
      const derivedState = progressionTopicState.get(String(topic._id)) || {
        accessible: false,
        unlocked: false,
        completed: false,
        status: 'Locked',
      };
      if (existingProgress) {
        topicObj.progress = {
          ...existingProgress.toObject(),
          status: derivedState.status,
        };
      } else {
        topicObj.progress = {
          status: derivedState.status,
          round1Score: 0,
          round2Score: 0,
          round3Score: 0,
          codingScore: 0,
          masteryScore: 0,
        };
      }
      topicObj.accessible = derivedState.accessible;
      topicObj.unlocked = derivedState.unlocked;
      topicObj.completed = derivedState.completed;
      return topicObj;
    });

    res.status(200).json({
      success: true,
      data: topicsWithProgress,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single topic by ID (with module info)
// @route   GET /api/topics/:topicId
// @access  Private
const getTopicById = async (req, res, next) => {
  try {
    const topic = await Topic.findById(req.params.topicId).populate('moduleId');

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
    }

    const progression = await buildProgressionForUser(req.user);
    const topicState = getTopicProgressionState(progression, topic._id);

    if (!topicState?.topic?.accessible) {
      return res.status(403).json({
        success: false,
        message: 'This topic is not available for your current level.',
      });
    }

    if (!topicState.topic.unlocked) {
      return res.status(403).json({
        success: false,
        message: 'This topic is locked. Complete earlier topics in this course first.',
      });
    }

    res.status(200).json({
      success: true,
      data: { topic },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllModules, getModuleById, getTopicsByModule, getTopicById };
