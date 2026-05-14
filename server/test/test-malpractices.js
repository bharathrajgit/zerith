const antiMalpractice = require('../services/antiMalpractice');

const sampleSession = {
  answers: [
    { questionId: 'q1', selectedOption: 0, timeToAnswer: 2 },
    { questionId: 'q2', selectedOption: 1, timeToAnswer: 1.5 },
    { questionId: 'q3', selectedOption: 2, timeToAnswer: 1.8 },
    { questionId: 'q4', selectedOption: 3, timeToAnswer: 2.2 },
    { questionId: 'q5', selectedOption: 1, timeToAnswer: 23 }
  ],
  tabSwitches: 4,
  copyAttempts: 1,
  windowBlurCount: 5
};

const result = antiMalpractice.analyzeSession(sampleSession);
console.log('Analysis result:');
console.log(JSON.stringify(result, null, 2));