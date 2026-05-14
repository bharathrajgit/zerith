// server/models/CodingProblem.js
const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const codingProblemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Problem description is required'],
    },
    problemStatement: {
      type: String,
      default: '',
    },
    inputFormat: {
      type: String,
      default: '',
    },
    outputFormat: {
      type: String,
      default: '',
    },
    sampleInput: {
      type: String,
      default: '',
    },
    sampleOutput: {
      type: String,
      default: '',
    },
    solutionApproach: {
      type: String,
      default: '',
    },
    timeComplexity: {
      type: String,
      default: '',
    },
    spaceComplexity: {
      type: String,
      default: '',
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: false,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: false,
    },
    hasCoding: {
      type: Boolean,
      default: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
    javaStarterCode: {
      type: String,
      default: '',
    },
    testCases: [testCaseSchema],
    constraints: {
      type: String,
      default: '',
    },
    hints: {
      type: [String],
      validate: {
        validator: (arr) => arr.length <= 3,
        message: 'A maximum of 3 hints allowed',
      },
      default: [],
    },
    solution: {
      type: String,
      default: '', // hidden from students
    },
    points: {
      type: Number,
      default: 20,
    },
    timeLimit: {
      type: Number,
      default: 30, // seconds
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    leetcodeUrl: {
      type: String,
      default: '',
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

module.exports = mongoose.model('CodingProblem', codingProblemSchema);
