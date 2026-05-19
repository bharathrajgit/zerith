/**
 * Calculate assessment score for a single round.
 * @param {Array} questions - Array of MCQ objects with correctAnswer
 * @param {Array} submissions - Array of { mcqId, selectedAnswer, timeTaken, hintsUsed }
 * @returns {Object} results
 */
const calculateAssessmentScore = (questions, submissions) => {
  const totalQuestions = questions.length;
  let correctAnswers = 0;

  const questionResults = submissions.map((submission) => {
    const question = questions.find(
      (q) => q._id.toString() === submission.mcqId.toString()
    );
    if (!question) {
      throw new Error(`MCQ ${submission.mcqId} not found in question set`);
    }
    const isCorrect = Number(submission.selectedAnswer) === question.correctAnswer;
    if (isCorrect) correctAnswers += 1;

    return {
      mcqId: submission.mcqId,
      isCorrect,
      selectedAnswer: submission.selectedAnswer,
      correctAnswer: question.correctAnswer,
      timeTaken: submission.timeTaken || 0,
    };
  });

  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  const totalTimeTaken = submissions.reduce((sum, submission) => sum + (submission.timeTaken || 0), 0);
  const averageTimeTaken = submissions.length > 0 ? totalTimeTaken / submissions.length : 0;

  return {
    correctAnswers,
    totalQuestions,
    accuracy: Math.round(accuracy * 100) / 100,
    averageTimeTaken: Math.round(averageTimeTaken * 100) / 100,
    passed: true, // will be overridden outside
    passCriteria: '',
    questionResults,
  };
};

const getRequiredCorrectAnswers = (round, totalQuestions) => {
  const criteria = {
    Basic: 0.8,
    Medium: 0.8,
    Hard: 0.6,
    Diagnostic: 0,
  };

  const requiredRatio = criteria[round] || 0;
  return round === 'Diagnostic'
    ? 0
    : Math.ceil(Math.max(Number(totalQuestions) || 0, 0) * requiredRatio);
};

/**
 * Determine pass/fail based on round difficulty and number correct.
 * @param {String} round - Basic/Medium/Hard/Diagnostic
 * @param {Number} correctAnswers - number of correct answers
 * @param {Number} totalQuestions - total questions in the round
 * @returns {Object} { passed, passCriteria }
 */
const evaluatePass = (round, correctAnswers, totalQuestions) => {
  const criteria = {
    Basic: 0.8,
    Medium: 0.8,
    Hard: 0.6,
    Diagnostic: 0,
  };
  const requiredRatio = criteria[round] || 0;
  const requiredCorrectAnswers = getRequiredCorrectAnswers(round, totalQuestions);
  const passed = round === 'Diagnostic'
    ? true
    : Number(correctAnswers || 0) >= requiredCorrectAnswers;

  return {
    passed,
    requiredCorrectAnswers,
    passCriteria:
      round === 'Diagnostic'
        ? 'Diagnostic test - no pass/fail'
        : `${Math.round(requiredRatio * 100)}% correct required (${requiredCorrectAnswers}/${totalQuestions})`,
  };
};

/**
 * Calculate mastery score from multiple round scores and behaviour.
 * @param {Number} mcqScore
 * @param {Number} codingScore
 * @param {Number} hintRate
 * @param {Number} retryRate
 * @returns {Object} { masteryScore, masteryLevel }
 */
const calculateMasteryScore = (mcqScore = 0, codingScore = 0, hintRate = 0, retryRate = 0) => {
  const hasCodingSignal = Number(codingScore) > 0;
  let score = hasCodingSignal
    ? mcqScore * 0.65 + codingScore * 0.35
    : mcqScore;

  score -= hintRate * 5;
  score -= retryRate * 3;

  score = Math.min(100, Math.max(0, Math.round(score)));

  let masteryLevel = 'Needs Revision';
  if (score >= 85) masteryLevel = 'Mastered';
  else if (score >= 70) masteryLevel = 'Proficient';
  else if (score >= 55) masteryLevel = 'Developing';

  return { masteryScore: score, masteryLevel };
};

/**
 * Calculate placement readiness from a map of topic mastery scores.
 * @param {Object} topicMasteryMap - e.g., { Arrays: 85, Trees: 70 }
 * @returns {Object} { readinessScore, readinessLevel }
 */
const calculatePlacementReadiness = (topicMasteryMap) => {
  const weights = {
    Arrays: 0.15,
    Strings: 0.1,
    Trees: 0.15,
    Graphs: 0.12,
    DP: 0.15,
    LinkedLists: 0.1,
    Recursion: 0.08,
    Sorting: 0.07,
    Searching: 0.05,
    StackQueue: 0.03,
  };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const [topic, weight] of Object.entries(weights)) {
    const score = topicMasteryMap[topic] || 0;
    weightedSum += score * weight;
    totalWeight += weight;
  }

  const readinessScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  let readinessLevel = 'Beginner';
  if (readinessScore >= 80) readinessLevel = 'Placement Ready';
  else if (readinessScore >= 60) readinessLevel = 'Interview Practicing';
  else if (readinessScore >= 40) readinessLevel = 'Foundation Building';

  return { readinessScore, readinessLevel };
};

module.exports = {
  calculateAssessmentScore,
  evaluatePass,
  getRequiredCorrectAnswers,
  calculateMasteryScore,
  calculatePlacementReadiness,
};
