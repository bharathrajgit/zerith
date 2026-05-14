const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const Module = require('./models/Module');
const Topic = require('./models/Topic');
const MCQ = require('./models/MCQ');
const { TOPIC_MODULE_ORDERS } = require('./services/adaptiveDiagnosticService');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dsa-platform')
  .then(async () => {
    console.log('Connected to MongoDB');

    const requiredOrders = Object.values(TOPIC_MODULE_ORDERS);
    const modules = await Module.find({ order: { $in: requiredOrders } })
      .select('_id order title')
      .sort({ order: 1 })
      .lean();

    console.log('\nDiagnostic Modules:');
    modules.forEach((moduleDoc) => {
      console.log(`Order ${moduleDoc.order}: ${moduleDoc.title} (${moduleDoc._id})`);
    });

    const moduleIds = modules.map((moduleDoc) => moduleDoc._id);
    const topics = await Topic.find({ moduleId: { $in: moduleIds } })
      .select('_id title order moduleId')
      .lean();

    console.log('\nTopics grouped by module:');
    modules.forEach((moduleDoc) => {
      const moduleTopics = topics
        .filter((topicDoc) => String(topicDoc.moduleId) === String(moduleDoc._id))
        .sort((left, right) => left.order - right.order);

      console.log(`\nModule ${moduleDoc.order} - ${moduleDoc.title}`);
      moduleTopics.forEach((topicDoc) => {
        console.log(`  Topic ${topicDoc.order}: ${topicDoc.title} (${topicDoc._id})`);
      });
    });

    const arraysModule = modules.find((moduleDoc) => moduleDoc.order === TOPIC_MODULE_ORDERS.arrays);
    if (arraysModule) {
      const arraysMcqCount = await MCQ.countDocuments({ moduleId: arraysModule._id, isActive: true });
      console.log(`\nActive MCQs for arrays module (${arraysModule.title}): ${arraysMcqCount}`);
    } else {
      console.log('\nArrays module not found in MongoDB');
    }

    console.log('\nDiagnostic coverage by module order:');
    Object.entries(TOPIC_MODULE_ORDERS).forEach(([topicKey, moduleOrder]) => {
      const moduleDoc = modules.find((candidate) => candidate.order === moduleOrder);
      console.log(`${topicKey} (module ${moduleOrder}): ${moduleDoc ? 'OK' : 'MISSING'}`);
    });

    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
