// server/models/PerformanceLog.js
const mongoose = require('mongoose');

const performanceLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    sessionDate: {
      type: Date,
      default: Date.now,
    },
    round1Accuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    round2Accuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    round3Accuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    codingAccuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    averageResponseTime: {
      type: Number,
      default: 0, // seconds
    },
    hintUsageRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
    streakDay: {
      type: Number,
      default: 0,
    },
    skipAttempts: {
      type: Number,
      default: 0,
    },
    errorPatterns: {
      type: [String],
      default: [],
    },
    masteryScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    weakFlag: {
      type: Boolean,
      default: false,
    },
    weakType: {
      type: String,
      enum: ['conceptual', 'application', 'reasoning', null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PerformanceLog', performanceLogSchema);