// server/test-models.js
require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const Institution = require('../models/Institution');
const MalpracticeLog = require('../models/MalpracticeLog');
const DiagnosticSession = require('../models/DiagnosticSession');

(async () => {
    console.log(process.env.MONGO_URI)
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dsa-platform');
    console.log('✅ MongoDB connected');

    console.log('✅ Models loaded successfully:');
    console.log(' - User:', User.modelName);
    console.log(' - Institution:', Institution.modelName);
    console.log(' - MalpracticeLog:', MalpracticeLog.modelName);
    console.log(' - DiagnosticSession:', DiagnosticSession.modelName);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Model loading failed:', err.message);
    process.exit(1);
  }
})();