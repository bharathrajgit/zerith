const mongoose = require('mongoose');

const diagnosticSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    sessionToken: {
      type: String,
      required: [true, 'Session token is required'],
      unique: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'expired'],
      default: 'in_progress',
    },
    topicsCovered: [
      {
        type: String,
      },
    ],
    minQuestions: {
      type: Number,
      default: 30,
    },
    maxQuestions: {
      type: Number,
      default: 50,
    },
    totalQuestions: {
      type: Number,
      default: 30,
    },
    timePerQuestion: {
      type: Number,
      default: 45,
    },
    answeredCount: {
      type: Number,
      default: 0,
    },
    blueprintVersion: {
      type: String,
      default: 'adaptive-v1',
    },
    questionPlan: [
      {
        topic: String,
        difficulty: String,
        source: String,
        sourceId: String,
        questionIndex: Number,
      },
    ],
    answers: [
      {
        topic: {
          type: String,
        },
        difficulty: {
          type: String,
          default: 'Hard',
        },
        isCorrect: {
          type: Boolean,
        },
        selectedOption: {
          type: Number,
        },
        wasTimedOut: {
          type: Boolean,
          default: false,
        },
        timeTaken: {
          type: Number,
        },
        answeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    result: {
      totalScore: Number,
      perTopicScores: {
        arrays: Number,
        strings: Number,
        searching: Number,
        sorting: Number,
        recursion: Number,
        linked_lists: Number,
        stack_queue: Number,
        trees: Number,
        graphs: Number,
        dp: Number,
      },
      avgTimePerQuestion: Number,
      assignedLevel: String,
      mlConfidence: Number,
      readinessScore: Number,
      unansweredCount: Number,
      malpractice: {
        riskLevel: String,
        riskScore: Number,
        cheatingProbability: Number,
      },
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

// TTL index: MongoDB automatically deletes documents when expiresAt is reached
diagnosticSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const DiagnosticSession = mongoose.model('DiagnosticSession', diagnosticSessionSchema);
module.exports = DiagnosticSession;
