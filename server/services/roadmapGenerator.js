const Progress = require('../models/Progress');
const Roadmap = require('../models/Roadmap');
const Topic = require('../models/Topic');
const User = require('../models/User');
const {
  COURSE_ORDER,
  buildProgressionForUser,
  normalizeCourseLevel,
} = require('./progressionService');

const PLAN_LABELS = {
  Beginner: '90-day',
  Intermediate: '60-day',
  Advanced: '30-day',
};

const PLAN_DAYS = {
  Beginner: 90,
  Intermediate: 60,
  Advanced: 30,
};

const ROADMAP_TASK_TYPES = new Set([
  'video',
  'basic-mcq',
  'coding',
  'video-analysis',
  'revision',
  'mcq-practice',
  'coding-practice',
]);

const ROADMAP_TASK_LABELS = {
  video: 'Watch the lesson video',
  'basic-mcq': 'Complete the topic MCQ',
  coding: 'Solve the coding problem',
  'video-analysis': 'Analyse and summarize the video',
  revision: 'Revise key concepts',
  'mcq-practice': 'Retry topic MCQs',
  'coding-practice': 'Practice the coding pattern',
};

const extractVideoId = (videoUrl) => {
  if (!videoUrl) return '';
  const raw = String(videoUrl).trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;

  try {
    const parsed = new URL(raw);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '');
    }
    const queryId = parsed.searchParams.get('v');
    if (queryId) return queryId;
    const embedMatch = parsed.pathname.match(/embed\/([A-Za-z0-9_-]{11})/);
    return embedMatch ? embedMatch[1] : '';
  } catch {
    return '';
  }
};

const isLegacyRoadmap = (roadmap) => {
  if (!roadmap || !Array.isArray(roadmap.weeks) || roadmap.weeks.length === 0) {
    return true;
  }

  return roadmap.weeks.some((week) =>
    !Array.isArray(week.days) ||
    week.days.length === 0 ||
    week.days.some((day) =>
      !Array.isArray(day.tasks) ||
      day.tasks.length === 0 ||
      day.tasks.some((task) => !ROADMAP_TASK_TYPES.has(task.type))
    )
  );
};

const createTask = (type, topic, overrides = {}) => ({
  type,
  referenceId: String(overrides.referenceId || topic?._id || ''),
  referenceType: overrides.referenceType || 'topic',
  moduleId: overrides.moduleId || topic?.moduleId || null,
  courseLevel: overrides.courseLevel || topic?.courseLevel || 'Beginner',
  title: overrides.title || `${topic?.title || 'Practice'} - ${ROADMAP_TASK_LABELS[type] || 'Task'}`,
  notes: overrides.notes || '',
  isCompleted: false,
  completedAt: null,
  isUnlocked: false,
});

const createDay = (dayNumber, focusLabel, tasks) => ({
  dayNumber,
  focusLabel,
  tasks,
  isCompleted: false,
  unlockedAt: null,
});

const toRoadmapTopic = (mod, topic) => ({
  _id: topic._id,
  moduleId: mod._id,
  moduleTitle: mod.title,
  title: topic.title,
  courseLevel: topic.courseLevel || mod.difficulty,
  order: topic.order,
  videoUrl: topic.videoUrl,
  requiresCoding: !!topic.requiresCoding,
});

const splitScheduledAndRecapModules = (progression, normalizedLevel) => {
  const learnerIndex = COURSE_ORDER.indexOf(normalizedLevel);
  const modules = progression.modules || [];
  const scheduledModules = modules.filter((mod) => {
    const courseIndex = COURSE_ORDER.indexOf(mod.difficulty || 'Beginner');
    return courseIndex === learnerIndex;
  });
  const recapModules = modules
    .filter((mod) => {
      const courseIndex = COURSE_ORDER.indexOf(mod.difficulty || 'Beginner');
      return courseIndex > -1 && courseIndex < learnerIndex;
    })
    .map((mod) => ({
      _id: mod._id,
      order: mod.order,
      title: mod.title,
      difficulty: mod.difficulty,
      totalTopics: mod.totalTopics,
      completedTopics: mod.completedTopics,
      percentage: mod.percentage,
      optional: true,
      foundation: !!mod.foundation,
    }));

  return { scheduledModules, recapModules };
};

const buildLearningDay = (topic, labelPrefix = 'Learn') =>
  createDay(dayNumberPlaceholder(), `${labelPrefix} ${topic.title}`, [
    createTask('video', topic),
    createTask('basic-mcq', topic),
    ...(topic.requiresCoding ? [createTask('coding', topic)] : []),
  ]);

const buildPracticeDay = (topic, type, notes) =>
  createDay(dayNumberPlaceholder(), `${topic.title} Practice`, [
    createTask(type, topic, { notes }),
  ]);

function dayNumberPlaceholder() {
  return -1;
}

const renumberDays = (days) =>
  days.map((day, index) => ({
    ...day,
    dayNumber: index + 1,
  }));

const buildTopicPracticeQueue = (topics, mode = 'primary') => {
  const queue = [];

  topics.forEach((topic) => {
    queue.push(
      buildPracticeDay(
        topic,
        'revision',
        mode === 'primary'
          ? 'Revise definitions, patterns, and key Java notes.'
          : 'Quick recap from your earlier foundation topics.'
      )
    );
  });

  topics.forEach((topic) => {
    queue.push(
      buildPracticeDay(
        topic,
        'video-analysis',
        'Rewatch critical parts and write down what the algorithm is doing step by step.'
      )
    );
  });

  topics.forEach((topic) => {
    queue.push(
      buildPracticeDay(
        topic,
        'mcq-practice',
        'Retry the MCQ until you can explain every answer confidently.'
      )
    );
  });

  topics.forEach((topic) => {
    queue.push(
      buildPracticeDay(
        topic,
        topic.requiresCoding ? 'coding-practice' : 'revision',
        topic.requiresCoding
          ? 'Practice the implementation pattern again with the editor.'
          : 'Summarize common mistakes and edge cases for this topic.'
      )
    );
  });

  return queue;
};

const buildScopedTopics = (progression, normalizedLevel) => {
  const learnerIndex = COURSE_ORDER.indexOf(normalizedLevel);
  const primaryTopics = [];
  const recapTopics = [];

  (progression.modules || [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .forEach((mod) => {
      const courseIndex = COURSE_ORDER.indexOf(mod.difficulty || 'Beginner');
      const mappedTopics = (mod.topics || [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((topic) => toRoadmapTopic(mod, topic));

      if (courseIndex === learnerIndex) {
        primaryTopics.push(...mappedTopics);
      } else if (courseIndex > -1 && courseIndex < learnerIndex) {
        recapTopics.push(...mappedTopics);
      }
    });

  return { primaryTopics, recapTopics };
};

const buildDailyPlan = (progression, normalizedLevel, planDays) => {
  const { primaryTopics, recapTopics } = buildScopedTopics(progression, normalizedLevel);
  const days = primaryTopics.map((topic) => buildLearningDay(topic));
  const primaryPracticeQueue = buildTopicPracticeQueue(primaryTopics, 'primary');
  const recapPracticeQueue = buildTopicPracticeQueue(recapTopics, 'recap');

  let primaryIndex = 0;
  let recapIndex = 0;
  let fallbackIndex = 0;
  const fallbackTopics = primaryTopics.length > 0 ? primaryTopics : recapTopics;

  while (days.length < planDays) {
    if (primaryIndex < primaryPracticeQueue.length) {
      days.push(primaryPracticeQueue[primaryIndex]);
      primaryIndex += 1;
      continue;
    }

    if (recapIndex < recapPracticeQueue.length) {
      days.push(recapPracticeQueue[recapIndex]);
      recapIndex += 1;
      continue;
    }

    if (fallbackTopics.length === 0) {
      break;
    }

    const fallbackTopic = fallbackTopics[fallbackIndex % fallbackTopics.length];
    days.push(
      buildPracticeDay(
        fallbackTopic,
        fallbackTopic.requiresCoding ? 'coding-practice' : 'revision',
        'Keep momentum with one more guided practice day.'
      )
    );
    fallbackIndex += 1;
  }

  return renumberDays(days.slice(0, planDays));
};

const buildWeeksFromDays = (days) => {
  const weeks = [];
  const totalWeeks = Math.ceil(days.length / 7);

  for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex += 1) {
    const weekDays = days.slice(weekIndex * 7, weekIndex * 7 + 7);
    const focusLabels = [...new Set(weekDays.map((day) => day.focusLabel).filter(Boolean))];
    const firstTask = weekDays.flatMap((day) => day.tasks).find(Boolean);

    weeks.push({
      weekNumber: weekIndex + 1,
      topic: focusLabels.slice(0, 2).join(' • ') || 'Daily Practice',
      moduleId: firstTask?.moduleId || null,
      weeklyGoal: focusLabels.length > 0
        ? `Complete: ${focusLabels.slice(0, 3).join(', ')}`
        : 'Keep your daily roadmap streak active',
      isCompleted: false,
      days: weekDays,
    });
  }

  return weeks;
};

const recalculateRoadmapState = async (roadmap, user, progression) => {
  if (!roadmap) return null;

  const watchedVideos = new Set((user?.watchedVideos || []).map(String));
  const progressDocs = await Progress.find({ userId: user._id }).lean();
  const progressByTopicId = new Map(
    progressDocs.map((doc) => [String(doc.topicId), doc])
  );
  const topicStateById = new Map();
  const topicMetaById = new Map();

  (progression.modules || []).forEach((mod) => {
    (mod.topics || []).forEach((topic) => {
      topicStateById.set(String(topic._id), {
        accessible: !!topic.accessible,
        unlocked: !!topic.unlocked,
        completed: !!topic.completed,
        requiresCoding: !!topic.requiresCoding,
      });
      topicMetaById.set(String(topic._id), {
        videoId: extractVideoId(topic.videoUrl),
      });
    });
  });

  let firstPendingDayNumber = null;
  let totalPlannedTasks = 0;
  let completedPlannedTasks = 0;
  let totalWorkDays = 0;
  let completedWorkDays = 0;
  let previousDayCompleted = true;

  roadmap.weeks.forEach((week) => {
    week.days.forEach((day) => {
      const tasks = Array.isArray(day.tasks) ? day.tasks : [];
      if (tasks.length === 0) {
        day.isCompleted = true;
        day.unlockedAt = day.unlockedAt || new Date();
        return;
      }

      totalWorkDays += 1;
      let anyUnlockedInDay = false;

      tasks.forEach((task) => {
        const topicId = String(task.referenceId || '');
        const topicState = topicStateById.get(topicId);
        const topicMeta = topicMetaById.get(topicId);
        const progress = progressByTopicId.get(topicId);
        const videoDone =
          watchedVideos.has(topicId) ||
          (!!topicMeta?.videoId && watchedVideos.has(topicMeta.videoId));
        const mcqDone = (progress?.round1Score || 0) >= 80;
        const codingDone = (progress?.codingScore || 0) >= 80;
        const topicUnlocked = !!topicState?.unlocked;
        const topicCompleted = !!topicState?.completed;
        const requiresCoding = !!topicState?.requiresCoding;

        let intrinsicUnlocked = false;
        let isCompleted = false;

        switch (task.type) {
          case 'video':
            intrinsicUnlocked = topicUnlocked;
            isCompleted = videoDone;
            break;
          case 'basic-mcq':
            intrinsicUnlocked = topicUnlocked && videoDone;
            isCompleted = mcqDone;
            break;
          case 'coding':
            intrinsicUnlocked = topicUnlocked && mcqDone && requiresCoding;
            isCompleted = codingDone;
            break;
          case 'video-analysis':
            intrinsicUnlocked = topicUnlocked && videoDone;
            isCompleted = mcqDone || topicCompleted;
            break;
          case 'mcq-practice':
            intrinsicUnlocked = topicUnlocked && videoDone;
            isCompleted = mcqDone;
            break;
          case 'coding-practice':
            intrinsicUnlocked = topicUnlocked && (requiresCoding ? mcqDone : videoDone);
            isCompleted = requiresCoding ? codingDone : topicCompleted;
            break;
          case 'revision':
          default:
            intrinsicUnlocked = topicUnlocked;
            isCompleted = topicCompleted;
            break;
        }

        task.isCompleted = isCompleted;
        task.isUnlocked = previousDayCompleted && intrinsicUnlocked;
        task.completedAt = isCompleted ? task.completedAt || progress?.updatedAt || new Date() : null;

        totalPlannedTasks += 1;
        if (isCompleted) completedPlannedTasks += 1;
        if (task.isUnlocked || isCompleted) anyUnlockedInDay = true;
      });

      day.isCompleted = tasks.every((task) => task.isCompleted);
      day.unlockedAt = previousDayCompleted && anyUnlockedInDay
        ? day.unlockedAt || new Date()
        : null;

      if (day.isCompleted) {
        completedWorkDays += 1;
      }

      if (firstPendingDayNumber === null && previousDayCompleted && anyUnlockedInDay && !day.isCompleted) {
        firstPendingDayNumber = day.dayNumber;
      }

      previousDayCompleted = previousDayCompleted && day.isCompleted;
    });

    week.isCompleted = week.days.every((day) => day.isCompleted);
  });

  const allDays = roadmap.weeks.flatMap((week) => week.days);
  roadmap.currentDay =
    firstPendingDayNumber ||
    allDays.find((day) => !day.isCompleted)?.dayNumber ||
    1;
  roadmap.totalDays = allDays.length;
  roadmap.totalWorkDays = totalWorkDays;
  roadmap.completedWorkDays = completedWorkDays;
  roadmap.totalPlannedTasks = totalPlannedTasks;
  roadmap.completedPlannedTasks = completedPlannedTasks;
  roadmap.overallProgress = totalPlannedTasks
    ? Math.round((completedPlannedTasks / totalPlannedTasks) * 100)
    : 0;

  return roadmap;
};

const generateRoadmap = async (userId, levelOverride) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (levelOverride) {
    user.currentLevel = levelOverride;
  }

  const normalizedLevel = normalizeCourseLevel(user.currentLevel);
  const planType = PLAN_LABELS[normalizedLevel] || PLAN_LABELS.Beginner;
  const planDays = PLAN_DAYS[normalizedLevel] || PLAN_DAYS.Beginner;
  const progression = await buildProgressionForUser(user);
  const days = buildDailyPlan(progression, normalizedLevel, planDays);
  const weeks = buildWeeksFromDays(days);
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  const targetDate = new Date(startDate);
  targetDate.setDate(targetDate.getDate() + planDays - 1);
  const { recapModules } = splitScheduledAndRecapModules(progression, normalizedLevel);

  let roadmap = await Roadmap.findOneAndUpdate(
    { userId },
    {
      userId,
      planType,
      startDate,
      targetDate,
      currentDay: 1,
      totalDays: planDays,
      totalWorkDays: planDays,
      completedWorkDays: 0,
      totalPlannedTasks: 0,
      completedPlannedTasks: 0,
      weeks,
      overallProgress: 0,
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  roadmap = await recalculateRoadmapState(roadmap, user, progression);
  await roadmap.save();

  await User.findByIdAndUpdate(userId, {
    roadmapGenerated: true,
    activeRoadmap: roadmap._id,
  });

  return { roadmap, recapModules };
};

const syncRoadmapForUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.activeRoadmap) return null;

  const roadmap = await Roadmap.findById(user.activeRoadmap);
  if (!roadmap) return null;

  const normalizedLevel = normalizeCourseLevel(user.currentLevel);
  const expectedPlanType = PLAN_LABELS[normalizedLevel] || PLAN_LABELS.Beginner;
  const expectedTotalDays = PLAN_DAYS[normalizedLevel] || PLAN_DAYS.Beginner;
  const progression = await buildProgressionForUser(user);
  const { recapModules } = splitScheduledAndRecapModules(progression, normalizedLevel);

  const planMismatch =
    roadmap.planType !== expectedPlanType || roadmap.totalDays !== expectedTotalDays;

  if (isLegacyRoadmap(roadmap) || planMismatch) {
    return generateRoadmap(userId, user.currentLevel);
  }

  await recalculateRoadmapState(roadmap, user, progression);
  await roadmap.save();
  return { roadmap, recapModules };
};

const markVideoCompleted = async (userId, topicId) => {
  const topic = await Topic.findById(topicId).select('videoUrl learningAssets').lean();
  const watchedIds = new Set([String(topicId)]);

  if (topic?.videoUrl) {
    const primaryVideoId = extractVideoId(topic.videoUrl);
    if (primaryVideoId) watchedIds.add(primaryVideoId);
  }

  (topic?.learningAssets || []).forEach((asset) => {
    if (asset?.type === 'video' && asset?.videoId) {
      watchedIds.add(String(asset.videoId));
    }
  });

  await User.findByIdAndUpdate(userId, {
    $addToSet: {
      watchedVideos: { $each: [...watchedIds] },
    },
  });

  return syncRoadmapForUser(userId);
};

module.exports = {
  PLAN_DAYS,
  generateRoadmap,
  isLegacyRoadmap,
  markVideoCompleted,
  recalculateRoadmapState,
  splitScheduledAndRecapModules,
  syncRoadmapForUser,
};
