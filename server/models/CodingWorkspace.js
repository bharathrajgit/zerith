const mongoose = require('mongoose');

const codingWorkspaceSchema = new mongoose.Schema(
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
    draftCode: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      enum: ['java'],
      default: 'java',
    },
    solved: {
      type: Boolean,
      default: false,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    lastRun: {
      verdict: { type: String, default: '' },
      runtimeOutput: { type: String, default: '' },
      compileOutput: { type: String, default: '' },
      executionTimeMs: { type: Number, default: 0 },
      updatedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

codingWorkspaceSchema.index({ userId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model('CodingWorkspace', codingWorkspaceSchema);
