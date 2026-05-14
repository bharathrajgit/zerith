const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dsa-platform')
  .then(async () => {
    console.log('Connected to MongoDB');

    const Module = require('./models/Module');
    const MCQ = require('./models/MCQ');
    const Topic = require('./models/Topic');
    const { TOPIC_MODULE_ORDERS } = require('./services/adaptiveDiagnosticService');

    const sampleMcqs = await MCQ.find({}).select('moduleId topicId question').limit(5).lean();
    console.log('Sample MCQs:');
    sampleMcqs.forEach((mcq) => {
      console.log(
        'ModuleId:',
        mcq.moduleId,
        'TopicId:',
        mcq.topicId,
        'Question:',
        `${mcq.question?.substring(0, 50) || ''}...`
      );
    });

    const requiredOrders = Object.values(TOPIC_MODULE_ORDERS);
    const modules = await Module.find({ order: { $in: requiredOrders } })
      .select('_id order title')
      .sort({ order: 1 })
      .lean();

    console.log('\nDiagnostic modules:');
    modules.forEach((moduleDoc) => {
      console.log(`  ${moduleDoc.order}: ${moduleDoc.title} (${moduleDoc._id})`);
    });

    const moduleIds = modules.map((moduleDoc) => moduleDoc._id);
    const topics = await Topic.find({ moduleId: { $in: moduleIds } })
      .select('_id title order moduleId')
      .sort({ order: 1 })
      .lean();

    console.log('\nTopics under diagnostic modules:');
    topics.forEach((topicDoc) => {
      const parentModule = modules.find((moduleDoc) => String(moduleDoc._id) === String(topicDoc.moduleId));
      console.log(
        `  ${topicDoc.title}: module ${parentModule?.order || 'unknown'} (${topicDoc.moduleId}), topic order ${topicDoc.order}`
      );
    });

    const arraysModule = modules.find((moduleDoc) => moduleDoc.order === TOPIC_MODULE_ORDERS.arrays);
    console.log('\nArrays module:', arraysModule || 'NOT FOUND');

    const mcqCounts = await MCQ.aggregate([
      { $match: { isActive: true, moduleId: { $in: moduleIds } } },
      { $group: { _id: '$moduleId', count: { $sum: 1 } } },
    ]);

    console.log('\nActive MCQ counts by moduleId:');
    mcqCounts.forEach((count) => {
      console.log('ModuleId:', count._id, 'Count:', count.count);
    });

    console.log('\nAdaptive service expects:');
    Object.entries(TOPIC_MODULE_ORDERS).forEach(([key, order]) => {
      console.log(`  ${key}: module ${order}`);
    });

    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
