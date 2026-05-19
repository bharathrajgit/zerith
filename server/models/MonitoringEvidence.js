const mongoose = require('mongoose');

const monitoringEvidenceSchema = new mongoose.Schema(
  {
    monitoringSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MonitoringSession',
      default: null,
      index: true,
    },
    malpracticeLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MalpracticeLog',
      default: null,
      index: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionType: {
      type: String,
      enum: ['assessment', 'coding', 'diagnostic'],
      required: true,
    },
    triggerCode: {
      type: String,
      required: true,
      trim: true,
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      required: true,
    },
    capturedAt: {
      type: Date,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    contentType: {
      type: String,
      enum: ['image/jpeg'],
      default: 'image/jpeg',
      required: true,
    },
    imageBuffer: {
      type: Buffer,
      required: true,
    },
    width: {
      type: Number,
      default: 0,
      min: 0,
    },
    height: {
      type: Number,
      default: 0,
      min: 0,
    },
    modelSource: {
      type: String,
      enum: ['onnx', 'heuristic'],
      required: true,
    },
    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
  },
  {
    timestamps: true,
  }
);

monitoringEvidenceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
monitoringEvidenceSchema.index({ malpracticeLogId: 1, capturedAt: -1 });
monitoringEvidenceSchema.index({ monitoringSessionId: 1, triggerCode: 1, capturedAt: -1 });

module.exports = mongoose.model('MonitoringEvidence', monitoringEvidenceSchema);
