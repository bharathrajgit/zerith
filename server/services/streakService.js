// server/services/streakService.js
const Streak = require('../models/Streak');
const User = require('../models/User');

/**
 * Log a user's daily activity and update streak data.
 * @param {String} userId
 * @param {Number} tasksCompleted
 * @param {Number} minutesSpent
 * @param {Array}  topicsStudied - array of topic names
 * @returns {Object} { currentStreak, longestStreak, isNewRecord }
 */
const logActivity = async (userId, tasksCompleted = 0, minutesSpent = 0, topicsStudied = []) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = await Streak.findOne({ userId });
  if (!streak) {
    streak = await Streak.create({ userId });
  }

  // --- Merge today's activity (same as before) ---
  const todayEntry = streak.activityLog.find(
    (a) => new Date(a.date).toDateString() === today.toDateString()
  );

  if (todayEntry) {
    todayEntry.tasksCompleted += tasksCompleted;
    todayEntry.minutesSpent += minutesSpent;
    topicsStudied.forEach((t) => {
      if (!todayEntry.topicsStudied.includes(t)) {
        todayEntry.topicsStudied.push(t);
      }
    });
  } else {
    streak.activityLog.push({
      date: today,
      tasksCompleted,
      minutesSpent,
      topicsStudied,
    });
  }

  // --- 🆕 Recalculate streak from activityLog ---
  // Collect unique active days, sorted descending
  const uniqueDays = [
    ...new Set(
      streak.activityLog.map((a) =>
        new Date(a.date).toDateString()
      )
    ),
  ].map((d) => new Date(d)).sort((a, b) => b - a); // newest first

  // Count consecutive days starting from today (or yesterday if today not present)
  let current = 0;
  if (uniqueDays.length > 0) {
    const newest = uniqueDays[0];
    const diffFromToday = Math.floor((today - newest) / (1000 * 60 * 60 * 24));

    // If newest is today or yesterday, start counting
    if (diffFromToday <= 1) {
      current = 1;
      for (let i = 1; i < uniqueDays.length; i++) {
        const prevDay = new Date(uniqueDays[i - 1]);
        const currDay = new Date(uniqueDays[i]);
        const diff = (prevDay - currDay) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          current++;
        } else {
          break;
        }
      }
    }
  }

  streak.currentStreak = current;

  // Update longest streak
  let isNewRecord = false;
  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
    isNewRecord = true;
  }

  // Last activity date is always today (since we logged something today)
  streak.lastActivityDate = today;

  // Total distinct active days
  streak.totalActiveDays = uniqueDays.length;

  // Weekly activity (last 7 days)
  const weeklyActivity = Array(7).fill(false);
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const activeOnDay = uniqueDays.some(
      (ud) => ud.toDateString() === d.toDateString()
    );
    weeklyActivity[6 - i] = activeOnDay;
  }
  streak.weeklyActivity = weeklyActivity;

  await streak.save();

  // Update User model
  await User.findByIdAndUpdate(userId, {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    totalStreakDays: streak.totalActiveDays,
    lastActiveAt: new Date(),
  });

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    isNewRecord,
  };
};

/**
 * Get full streak data for a user, including consistency score.
 * @param {String} userId
 * @returns {Object} { currentStreak, longestStreak, totalActiveDays,
 *                     consistencyScore, weeklyActivity, activityLog }
 */
const getStreakData = async (userId) => {
  let streak = await Streak.findOne({ userId });
  if (!streak) {
    streak = await Streak.create({ userId });
  }

  // Calculate consistency score
  const user = await User.findById(userId).select('createdAt');
  const daysSinceJoined = Math.max(
    1,
    Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  );
  let consistencyScore = Math.round((streak.totalActiveDays / daysSinceJoined) * 100);
  if (consistencyScore > 100) consistencyScore = 100;

  // Return last 30 days of activity
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentActivityLog = streak.activityLog.filter(
    (a) => new Date(a.date) >= thirtyDaysAgo
  );

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    totalActiveDays: streak.totalActiveDays,
    consistencyScore,
    weeklyActivity: streak.weeklyActivity,
    activityLog: recentActivityLog,
  };
};

module.exports = { logActivity, getStreakData };