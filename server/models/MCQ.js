// server/models/MCQ.js
const mongoose = require('mongoose');

const mcqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
    },
    options: {
      type: [String],
      validate: {
        validator: (arr) => arr.length === 4,
        message: 'MCQ must have exactly 4 options',
      },
      required: true,
    },
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    explanation: {
      type: String,
      required: [true, 'Explanation for the correct answer is required'],
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
    difficulty: {
      type: String,
      enum: ['Basic', 'Medium', 'Hard'],
      required: true,
    },
    questionType: {
      type: String,
      enum: ['conceptual', 'application', 'reasoning'],
      required: true,
    },
    timeLimit: {
      type: Number,
      default: 60, // seconds
    },
    points: {
      type: Number,
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MCQ', mcqSchema);