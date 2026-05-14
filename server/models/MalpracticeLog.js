const mongoose = require('mongoose');

const malpracticeLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
    },
    monitoringSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MonitoringSession',
      default: null,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
    },
    sessionType: {
      type: String,
      enum: ['assessment', 'coding', 'diagnostic'],
      default: 'assessment',
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      default: null,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      default: null,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodingProblem',
      default: null,
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      required: [true, 'Risk level is required'],
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 1,
    },
    flags: [
      {
        type: String,
      },
    ],
    reasons: [
      {
        type: String,
      },
    ],
    sessionData: {
      ipAddress: String,
      tabSwitches: { type: Number, default: 0 },
      copyAttempts: { type: Number, default: 0 },
      windowBlurCount: { type: Number, default: 0 },
      avgAnswerTime: Number,
      timingStdDev: Number,
      totalQuestions: Number,
      changedAnswers: { type: Number, default: 0 },
    },
    mlCheatingProbability: {
      type: Number,
      default: 0,
    },
    mlCheatingLabel: {
      type: Number,
      default: 0,
    },
    mlCheatingFallback: {
      type: Boolean,
      default: false,
    },
    sourceFlags: {
      type: [String],
      default: [],
    },
    warningCount: {
      type: Number,
      default: 0,
    },
    warningLimit: {
      type: Number,
      default: 0,
    },
    finalFlagged: {
      type: Boolean,
      default: false,
    },
    visionFindings: {
      multipleFaces: { type: Boolean, default: false },
      headPoseAway: { type: Boolean, default: false },
      gazeAway: { type: Boolean, default: false },
      faceMissing: { type: Boolean, default: false },
      faceCount: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
    },
    similarSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
    },
    similarityScore: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed', 'confirmed'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNote: String,
  },
  {
    timestamps: true,
  }
);

malpracticeLogSchema.index({ monitoringSessionId: 1 }, { unique: true, sparse: true });

const MalpracticeLog = mongoose.model('MalpracticeLog', malpracticeLogSchema);
module.exports = MalpracticeLog;
