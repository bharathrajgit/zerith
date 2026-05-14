// server/models/Module.js
const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Module title is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Module description is required'],
    },
    order: {
      type: Number,
      required: [true, 'Module order is required'],
      min: 1,
    },
    icon: {
      type: String,
      default: '',
    },
    totalTopics: {
      type: Number,
      default: 0,
    },
    estimatedDays: {
      type: Number,
      required: [true, 'Estimated days to complete module is required'],
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    topics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Module', moduleSchema);