const CodingProblem = require('../models/CodingProblem');
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const Topic = require('../models/Topic');

const COURSE_ORDER = ['Beginner', 'Intermediate', 'Advanced'];

const DIFFICULTY_RANK = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

const normalizeCourseLevel = (rawLevel) => {
  const normalized = String(rawLevel || '').trim().toLowerCase();
  if (normalized === 'intermediate') return 'Intermediate';
  if (
    normalized === 'advance' ||
    normalized === 'advanced' ||
    normalized === 'placement-ready' ||
    normalized === 'placement ready'
  ) {
    return 'Advanced';
  }
  return 'Beginner';
};

const getDifficultyRank = (difficulty) =>
  DIFFICULTY_RANK[difficulty] || DIFFICULTY_RANK.Beginner;

const getCourseIndex = (difficulty) =>
  COURSE_ORDER.indexOf(difficulty);

const isTopicCompleted = (progressDoc, requiresCoding) => {
  if (!progressDoc) return false;
  if (progressDoc.status === 'Completed' || progressDoc.status === 'Mastered') {
    return true;
  }

  const mcqPassed = (progressDoc.round1Score || 0) >= 80;
  if (!mcqPassed) return false;

  if (!requiresCoding) {
    return true;
  }

  return (progressDoc.codingScore || 0) >= 80;
};

const getModuleProgressionState = (progression, moduleId) =>
  (progression?.modules || []).find((mod) => String(mod._id) === String(moduleId)) || null;

const getTopicProgressionState = (progression, topicId) => {
  for (const mod of progression?.modules || []) {
    const topic = (mod.topics || []).find((entry) => String(entry._id) === String(topicId));
    if (topic) {
      return {
        module: mod,
        topic,
      };
    }
  }
  return null;
};

const getCourseGateType = (learnerLevel, courseDifficulty, completionByCourse) => {
  const learnerIndex = getCourseIndex(normalizeCourseLevel(learnerLevel));
  const courseIndex = getCourseIndex(courseDifficulty);

  if (courseIndex < 0) return 'locked';
  if (courseIndex < learnerIndex) return 'full';
  if (courseIndex === learnerIndex) return 'sequential';

  const requiredCourses = COURSE_ORDER.slice(learnerIndex, courseIndex);
  return requiredCourses.every((difficulty) => completionByCourse[difficulty])
    ? 'sequential'
    : 'locked';
};

const buildProgressionFromData = ({
  currentLevel,
  modules,
  topics,
  progressDocs,
  codingTopicIds = [],
}) => {
  const learnerLevel = normalizeCourseLevel(currentLevel);
  const learnerIndex = getCourseIndex(learnerLevel);
  const codingTopicIdSet = new Set(codingTopicIds.map((id) => String(id)));
  const progressByTopicId = new Map(
    progressDocs.map((doc) => [String(doc.topicId), doc])
  );

  const modulesSorted = [...modules].sort((a, b) => a.order - b.order);
  const topicsByModuleId = new Map();
  topics.forEach((topic) => {
    const key = String(topic.moduleId);
    if (!topicsByModuleId.has(key)) topicsByModuleId.set(key, []);
    topicsByModuleId.get(key).push(topic);
  });
  topicsByModuleId.forEach((list) => list.sort((a, b) => a.order - b.order));

  const topicMetaById = new Map();
  const moduleCompletionById = new Map();
  const completionByCourse = {
    Beginner: false,
    Intermediate: false,
    Advanced: false,
  };

  modulesSorted.forEach((mod) => {
    const moduleTopics = topicsByModuleId.get(String(mod._id)) || [];
    let completedTopics = 0;

    moduleTopics.forEach((topic) => {
      const progressDoc = progressByTopicId.get(String(topic._id));
      const requiresCoding = codingTopicIdSet.has(String(topic._id));
      const completed = isTopicCompleted(progressDoc, requiresCoding);
      if (completed) completedTopics += 1;

      topicMetaById.set(String(topic._id), {
        topic,
        module: mod,
        progressDoc,
        requiresCoding,
        completed,
      });
    });

    moduleCompletionById.set(
      String(mod._id),
      moduleTopics.length > 0 && completedTopics === moduleTopics.length
    );
  });

  COURSE_ORDER.forEach((difficulty) => {
    const courseModules = modulesSorted.filter(
      (mod) => (mod.difficulty || 'Beginner') === difficulty
    );

    if (courseModules.length === 0) {
      completionByCourse[difficulty] = false;
      return;
    }

    completionByCourse[difficulty] = courseModules.every((mod) =>
      moduleCompletionById.get(String(mod._id))
    );
  });

  const modulesWithProgress = modulesSorted.map((mod) => {
    const moduleDifficulty = mod.difficulty || 'Beginner';
    const courseIndex = getCourseIndex(moduleDifficulty);
    const accessType = getCourseGateType(learnerLevel, moduleDifficulty, completionByCourse);
    const moduleTopicsRaw = topicsByModuleId.get(String(mod._id)) || [];
    const courseModules = modulesSorted.filter(
      (entry) => (entry.difficulty || 'Beginner') === moduleDifficulty
    );
    const currentModuleIndexWithinCourse = courseModules.findIndex(
      (entry) => String(entry._id) === String(mod._id)
    );
    const firstIncompleteModuleIndex = courseModules.findIndex(
      (entry) => !moduleCompletionById.get(String(entry._id))
    );
    const activeModuleIndex = firstIncompleteModuleIndex === -1
      ? courseModules.length - 1
      : firstIncompleteModuleIndex;

    const moduleAccessible = accessType === 'full'
      || (accessType === 'sequential' && currentModuleIndexWithinCourse <= activeModuleIndex);
    const moduleSequential = accessType === 'sequential';
    const moduleFullyUnlocked = accessType === 'full'
      || (accessType === 'sequential' && currentModuleIndexWithinCourse < activeModuleIndex);
    const moduleCompleted = moduleCompletionById.get(String(mod._id)) || false;

    const firstIncompleteTopicIndex = moduleTopicsRaw.findIndex(
      (topic) => !topicMetaById.get(String(topic._id))?.completed
    );
    const unlockThroughIndex = firstIncompleteTopicIndex === -1
      ? moduleTopicsRaw.length - 1
      : firstIncompleteTopicIndex;

    const moduleTopics = moduleTopicsRaw.map((topic, index) => {
      const meta = topicMetaById.get(String(topic._id));
      const progressDoc = meta?.progressDoc || null;
      const completed = !!meta?.completed;
      const topicAccessible = moduleAccessible;
      let unlocked = false;

      if (topicAccessible) {
        if (moduleFullyUnlocked) {
          unlocked = true;
        } else if (moduleSequential) {
          unlocked = completed || index <= unlockThroughIndex;
        } else {
          unlocked = completed;
        }
      }

      const status = completed
        ? 'Completed'
        : !topicAccessible || !unlocked
          ? 'Locked'
          : progressDoc?.status === 'InProgress'
            ? 'InProgress'
            : 'Unlocked';

      return {
        _id: topic._id,
        title: topic.title,
        description: topic.description || '',
        order: topic.order,
        videoUrl: topic.videoUrl,
        videoTitle: topic.videoTitle,
        videoDuration: topic.videoDuration,
        estimatedMinutes: topic.estimatedMinutes || topic.videoDuration || 0,
        difficultyLevel: topic.difficultyLevel,
        courseLevel: topic.courseLevel || moduleDifficulty,
        learningAssets: Array.isArray(topic.learningAssets) ? topic.learningAssets : [],
        requiresCoding: !!meta?.requiresCoding,
        accessible: topicAccessible,
        unlocked,
        completed,
        status,
        progress: {
          masteryScore: progressDoc?.masteryScore || 0,
          round1Score: progressDoc?.round1Score || 0,
          round2Score: progressDoc?.round2Score || 0,
          round3Score: progressDoc?.round3Score || 0,
          codingScore: progressDoc?.codingScore || 0,
          totalAttempts: progressDoc?.totalAttempts || 0,
          hintsUsed: progressDoc?.hintsUsed || 0,
          timeSpentMinutes: progressDoc?.timeSpentMinutes || 0,
          lastAttemptAt: progressDoc?.lastAttemptAt || null,
          completedAt: progressDoc?.completedAt || null,
        },
      };
    });

    const completedTopics = moduleTopics.filter((topic) => topic.completed).length;
    const totalTopics = moduleTopics.length;

    let moduleStatus = 'Locked';
    if (moduleCompleted) {
      moduleStatus = 'Completed';
    } else if (moduleAccessible && moduleTopics.some((topic) => topic.unlocked)) {
      moduleStatus = moduleTopics.some((topic) => topic.status === 'InProgress')
        ? 'InProgress'
        : 'Unlocked';
    }

    return {
      _id: mod._id,
      order: mod.order,
      title: mod.title,
      description: mod.description,
      icon: mod.icon || 'BookOpen',
      difficulty: moduleDifficulty,
      estimatedDays: mod.estimatedDays || 0,
      foundation: courseIndex < learnerIndex,
      accessType,
      visible: true,
      accessible: moduleAccessible,
      sequentialUnlock: moduleSequential,
      unlocked: moduleAccessible,
      completed: moduleCompleted,
      status: moduleStatus,
      completedTopics,
      totalTopics,
      percentage: totalTopics
        ? Math.round((completedTopics / totalTopics) * 100)
        : 0,
      topics: moduleTopics,
    };
  });

  const totalTopics = modulesWithProgress.reduce(
    (sum, mod) => sum + (mod.totalTopics || 0),
    0
  );
  const completedTopics = modulesWithProgress.reduce(
    (sum, mod) => sum + (mod.completedTopics || 0),
    0
  );

  const courseOverview = COURSE_ORDER.map((difficulty) => {
    const courseModules = modulesWithProgress.filter((mod) => mod.difficulty === difficulty);
    const courseTotalTopics = courseModules.reduce((sum, mod) => sum + mod.totalTopics, 0);
    const courseCompletedTopics = courseModules.reduce((sum, mod) => sum + mod.completedTopics, 0);

    return {
      difficulty,
      accessType: getCourseGateType(learnerLevel, difficulty, completionByCourse),
      completed: completionByCourse[difficulty],
      totalTopics: courseTotalTopics,
      completedTopics: courseCompletedTopics,
      percentage: courseTotalTopics
        ? Math.round((courseCompletedTopics / courseTotalTopics) * 100)
        : 0,
    };
  });

  return {
    currentLevel: learnerLevel,
    learnerRank: getDifficultyRank(learnerLevel),
    overview: {
      totalTopics,
      completedTopics,
      percentage: totalTopics
        ? Math.round((completedTopics / totalTopics) * 100)
        : 0,
    },
    courses: courseOverview,
    modules: modulesWithProgress,
  };
};

const buildProgressionForUser = async (user) => {
  const [modules, topics, progressDocs, codingProblems] = await Promise.all([
    Module.find({ isActive: true }).sort({ order: 1 }).lean(),
    Topic.find({}).sort({ moduleId: 1, order: 1 }).lean(),
    Progress.find({ userId: user._id }).lean(),
    CodingProblem.find({ isActive: true, hasCoding: { $ne: false } }).select('topicId').lean(),
  ]);

  return buildProgressionFromData({
    currentLevel: user?.currentLevel,
    modules,
    topics,
    progressDocs,
    codingTopicIds: codingProblems
      .map((problem) => problem.topicId)
      .filter(Boolean),
  });
};

module.exports = {
  COURSE_ORDER,
  buildProgressionForUser,
  buildProgressionFromData,
  getModuleProgressionState,
  getTopicProgressionState,
  normalizeCourseLevel,
  getDifficultyRank,
  getCourseGateType,
  isTopicCompleted,
};
