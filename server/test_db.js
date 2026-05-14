const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const Module = require('./models/Module');
const Topic = require('./models/Topic');
const MCQ = require('./models/MCQ');
const { TOPIC_MODULE_ORDERS } = require('./services/adaptiveDiagnosticService');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dsa-platform')
  .then(async () => {
    console.log('Connected to MongoDB - checking database state...');

    const topicCount = await Topic.countDocuments();
    const mcqCount = await MCQ.countDocuments();

    console.log(`\n=== DATABASE STATE ===`);
    console.log(`Topics: ${topicCount}`);
    console.log(`MCQs: ${mcqCount}`);

    if (topicCount === 0) {
      console.log('\nNo topics found. Database likely needs seeding.');
      process.exit(1);
    }

    const requiredOrders = Object.values(TOPIC_MODULE_ORDERS);
    const modules = await Module.find({ order: { $in: requiredOrders } })
      .select('_id order title')
      .sort({ order: 1 })
      .lean();

    console.log('\n=== DIAGNOSTIC MODULES ===');
    modules.forEach((moduleDoc) => {
      console.log(`${moduleDoc.order}: ${moduleDoc.title}`);
    });

    const arraysModule = modules.find((moduleDoc) => moduleDoc.order === TOPIC_MODULE_ORDERS.arrays);
    if (arraysModule) {
      console.log(`\nArrays module found: ${arraysModule.title} (ID: ${arraysModule._id})`);

      const arraysTopics = await Topic.find({ moduleId: arraysModule._id })
        .select('_id title order')
        .sort({ order: 1 })
        .lean();
      const arraysMcqs = await MCQ.countDocuments({ moduleId: arraysModule._id, isActive: true });

      console.log('Arrays topics:');
      arraysTopics.forEach((topicDoc) => {
        console.log(`  ${topicDoc.order}: ${topicDoc.title} (${topicDoc._id})`);
      });
      console.log(`Active MCQs for Arrays: ${arraysMcqs}`);

      if (arraysMcqs === 0) {
        console.log('No active MCQs found for the Arrays module.');
      }
    } else {
      console.log('\nNo Arrays module found (order 3)');
    }

    console.log('\n=== EXPECTED BY ADAPTIVE SERVICE ===');
    Object.entries(TOPIC_MODULE_ORDERS).forEach(([key, order]) => {
      const hasModule = modules.some((moduleDoc) => moduleDoc.order === order);
      console.log(`${key} (module ${order}): ${hasModule ? 'OK' : 'MISSING'}`);
    });

    process.exit(0);
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
