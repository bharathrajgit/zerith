// server/models/Assessment.js
const mongoose = require('mongoose');

const questionEntrySchema = new mongoose.Schema(
  {
    mcqId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MCQ',
      required: true,
    },
    selectedAnswer: {
      type: Number,
      default: null,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    timeTaken: {
      type: Number, // seconds
      default: 0,
    },
    hintsUsed: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const assessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: null,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: null,
    },
    round: {
      type: String,
      enum: ['Basic', 'Medium', 'Hard', 'Diagnostic'],
      required: true,
    },
    questions: [questionEntrySchema],
    totalQuestions: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number, // percentage
      default: 0,
    },
    totalTimeTaken: {
      type: Number, // seconds
      default: 0,
    },
    averageTimePerQuestion: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    monitoringSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MonitoringSession',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Assessment', assessmentSchema);    
