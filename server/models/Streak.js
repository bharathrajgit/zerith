// server/models/Streak.js
const mongoose = require('mongoose');

const activityEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    tasksCompleted: { type: Number, default: 0 },
    minutesSpent: { type: Number, default: 0 },
    topicsStudied: { type: [String], default: [] },
  },
  { _id: false }
);

const streakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    totalActiveDays: {
      type: Number,
      default: 0,
    },
    lastActivityDate: {
      type: Date,
      default: null,
    },
    activityLog: [activityEntrySchema],
    weeklyActivity: {
      type: [Boolean],
      default: Array(7).fill(false),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Streak', streakSchema);