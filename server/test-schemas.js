// server/test-schemas.js
const mongoose = require('mongoose');
require('dotenv').config(); // if you use .env

const User = require('./models/User');
const Module = require('./models/Module');
const Topic = require('./models/Topic');
const MCQ = require('./models/MCQ');
const CodingProblem = require('./models/CodingProblem');
const Assessment = require('./models/Assessment');
const Progress = require('./models/Progress');
const Roadmap = require('./models/Roadmap');
const Streak = require('./models/Streak');
const PerformanceLog = require('./models/PerformanceLog');

const testLoad = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dsa-platform');
    console.log('✅ MongoDB connected');
    console.log('✅ All schemas loaded successfully:\n');

    console.log(' - User:', User.modelName);
    console.log(' - Module:', Module.modelName);
    console.log(' - Topic:', Topic.modelName);
    console.log(' - MCQ:', MCQ.modelName);
    console.log(' - CodingProblem:', CodingProblem.modelName);
    console.log(' - Assessment:', Assessment.modelName);
    console.log(' - Progress:', Progress.modelName);
    console.log(' - Roadmap:', Roadmap.modelName);
    console.log(' - Streak:', Streak.modelName);
    console.log(' - PerformanceLog:', PerformanceLog.modelName);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema loading failed:', error.message);
    process.exit(1);
  }
};

testLoad();