// server/models/Topic.js
const mongoose = require('mongoose');

const learningAssetSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: 'video',
      trim: true,
    },
    source: {
      type: String,
      default: 'curated',
      trim: true,
    },
    videoId: {
      type: String,
      default: '',
      trim: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    durationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    language: {
      type: String,
      default: 'English',
      trim: true,
    },
    tech: {
      type: String,
      default: 'Java',
      trim: true,
    },
    isCodingRelevant: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Topic title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Module reference is required'],
    },
    order: {
      type: Number,
      required: [true, 'Order within module is required'],
    },
    videoUrl: {
      type: String,
      default: '',
    },
    videoTitle: {
      type: String,
      default: '',
    },
    videoDuration: {
      type: Number,
      default: 0, // minutes
    },
    videoStartSeconds: {
      type: Number,
      default: 0, // start time in seconds
    },
    videoEndSeconds: {
      type: Number,
      default: 0, // end time in seconds
    },
    difficultyLevel: {
      type: String,
      enum: ['Basic', 'Medium', 'Hard'],
      default: 'Basic',
    },
    courseLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    isLocked: {
      type: Boolean,
      default: true,
    },
    unlockCondition: {
      type: String,
      default: '',
    },
    estimatedMinutes: {
      type: Number,
      default: 0,
    },
    javaConceptTags: {
      type: [String],
      default: [],
    },
    learningAssets: {
      type: [learningAssetSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Topic', topicSchema);
