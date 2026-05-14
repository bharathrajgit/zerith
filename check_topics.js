const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dsa-platform')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Get distinct topicIds from MCQ collection
    const MCQ = require('./server/models/MCQ');
    const Topic = require('./server/models/Topic');
    
    // Check all MCQ documents
    const mcqs = await MCQ.find({}).select('topicId question').limit(5);
    console.log('Sample MCQs:');
    mcqs.forEach(mcq => {
      console.log('TopicId:', mcq.topicId, 'Question:', mcq.question?.substring(0, 50) + '...');
    });
    
    // Get all topics
    const topics = await Topic.find({}).select('moduleOrder name');
    console.log('\nAll Topics:');
    topics.forEach(topic => {
      console.log('Name:', topic.name, 'ModuleOrder:', topic.moduleOrder);
    });
    
    // Check for arrays topic specifically
    const arraysTopic = await Topic.findOne({ moduleOrder: 3 });
    console.log('\nArrays Topic (moduleOrder 3):', arraysTopic);
    
    // Count MCQs by topic
    const mcqCounts = await MCQ.aggregate([
      { $group: { _id: '$topicId', count: { $sum: 1 } } }
    ]);
    console.log('\nMCQ counts by topicId:');
    mcqCounts.forEach(count => {
      console.log('TopicId:', count._id, 'Count:', count.count);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
