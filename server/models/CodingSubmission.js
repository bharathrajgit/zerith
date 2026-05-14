const mongoose = require('mongoose');

const submissionTestResultSchema = new mongoose.Schema(
  {
    input: { type: String, default: '' },
    expectedOutput: { type: String, default: '' },
    actualOutput: { type: String, default: '' },
    passed: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
    runtimeMs: { type: Number, default: 0 },
    error: { type: String, default: '' },
  },
  { _id: false }
);

const codingSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodingProblem',
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: false,
      default: null,
    },
    mode: {
      type: String,
      enum: ['run', 'submit'],
      required: true,
    },
    language: {
      type: String,
      enum: ['java'],
      default: 'java',
    },
    code: {
      type: String,
      required: true,
    },
    verdict: {
      type: String,
      enum: [
        'Accepted',
        'Wrong Answer',
        'Compilation Error',
        'Runtime Error',
        'Time Limit Exceeded',
        'Pending',
      ],
      default: 'Pending',
    },
    compileOutput: {
      type: String,
      default: '',
    },
    runtimeOutput: {
      type: String,
      default: '',
    },
    executionTimeMs: {
      type: Number,
      default: 0,
    },
    passedVisibleCount: {
      type: Number,
      default: 0,
    },
    totalVisibleCount: {
      type: Number,
      default: 0,
    },
    passedHiddenCount: {
      type: Number,
      default: 0,
    },
    totalHiddenCount: {
      type: Number,
      default: 0,
    },
    testResults: {
      type: [submissionTestResultSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

codingSubmissionSchema.index({ userId: 1, problemId: 1, createdAt: -1 });

module.exports = mongoose.model('CodingSubmission', codingSubmissionSchema);
