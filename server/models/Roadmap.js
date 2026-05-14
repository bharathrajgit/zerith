// server/models/Roadmap.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'video',
        'basic-mcq',
        'coding',
        'video-analysis',
        'revision',
        'mcq-practice',
        'coding-practice',
      ],
      required: true,
    },
    referenceId: { type: String, default: '' },
    referenceType: {
      type: String,
      enum: ['topic', 'coding-problem', 'module', 'course'],
      default: 'topic',
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      default: null,
    },
    courseLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    title: { type: String, default: '' },
    notes: { type: String, default: '' },
    isUnlocked: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const daySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },
    tasks: [taskSchema],
    isCompleted: { type: Boolean, default: false },
    unlockedAt: { type: Date, default: null },
  },
  { _id: false }
);

const weekSchema = new mongoose.Schema(
  {
    weekNumber: { type: Number, required: true },
    topic: { type: String, default: '' },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
    },
    days: [daySchema],
    weeklyGoal: { type: String, default: '' },
    isCompleted: { type: Boolean, default: false },
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    planType: {
      type: String,
      enum: ['90-day', '60-day', '30-day'],
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
    },
    currentDay: {
      type: Number,
      default: 1,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    totalWorkDays: {
      type: Number,
      default: 0,
    },
    completedWorkDays: {
      type: Number,
      default: 0,
    },
    totalPlannedTasks: {
      type: Number,
      default: 0,
    },
    completedPlannedTasks: {
      type: Number,
      default: 0,
    },
    weeks: [weekSchema],
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Roadmap', roadmapSchema);
