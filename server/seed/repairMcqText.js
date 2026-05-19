require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const MCQ = require('../models/MCQ');
const { normalizeSeedString } = require('./textSanitizer');

const normalizeMcqDocument = (mcq) => {
  const nextQuestion = normalizeSeedString(mcq.question);
  const nextOptions = (mcq.options || []).map((option) => normalizeSeedString(option));
  const nextExplanation = normalizeSeedString(mcq.explanation);
  const nextTags = (mcq.tags || []).map((tag) => normalizeSeedString(tag));

  const changed = (
    nextQuestion !== mcq.question
    || JSON.stringify(nextOptions) !== JSON.stringify(mcq.options || [])
    || nextExplanation !== mcq.explanation
    || JSON.stringify(nextTags) !== JSON.stringify(mcq.tags || [])
  );

  return {
    changed,
    update: {
      question: nextQuestion,
      options: nextOptions,
      explanation: nextExplanation,
      tags: nextTags,
    },
  };
};

async function repairMcqText() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const mcqs = await MCQ.find({}).lean();
  const operations = [];

  mcqs.forEach((mcq) => {
    const normalized = normalizeMcqDocument(mcq);
    if (!normalized.changed) {
      return;
    }

    operations.push({
      updateOne: {
        filter: { _id: mcq._id },
        update: { $set: normalized.update },
      },
    });
  });

  if (!operations.length) {
    console.log('No MCQ text repairs were needed.');
    await mongoose.disconnect();
    return;
  }

  const result = await MCQ.bulkWrite(operations, { ordered: false });
  console.log(`Repaired ${result.modifiedCount} MCQ documents.`);

  const sample = await MCQ.findOne({
    question: /Diagonal traversal|2D prefix sum/i,
  }).lean();

  if (sample) {
    console.log('Sample repaired question:');
    console.log(sample.question);
    console.log(sample.options);
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

repairMcqText().catch((error) => {
  console.error('MCQ repair failed:', error.message || error);
  process.exit(1);
});
