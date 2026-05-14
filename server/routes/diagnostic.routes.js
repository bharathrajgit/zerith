const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User');
const DiagnosticSession = require('../models/DiagnosticSession');
const MonitoringSession = require('../models/MonitoringSession');
const { generateRoadmap } = require('../services/roadmapGenerator');
const {
  classifyLevel,
  normalizeLevelFromScore,
  buildDiagnosticPerformanceData,
  getReadinessScore,
  getCheatingRisk,
} = require('../services/mlService');
const { logActivity } = require('../services/streakService');
const antiMalpractice = require('../services/antiMalpractice');
const { finalizeSession } = require('../services/monitoringService');
const {
  MIN_QUESTIONS,
  MAX_QUESTIONS,
  QUESTION_TIME_LIMIT,
  SESSION_EXPIRY_MS,
  buildResults,
  service: adaptiveDiagnosticService,
} = require('../services/adaptiveDiagnosticService');

const ALLOWED_LEVELS = ['Beginner', 'Intermediate', 'Placement-Ready'];

const average = (values = []) => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const computeStdDev = (values = []) => {
  if (values.length < 2) return 0;
  const mean = average(values);
  const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;
  return Math.sqrt(variance);
};

const buildCheatingPayload = (sessionData = {}, answers = [], diagnosticScore = 0) => {
  const answerTimes = answers.map((answer) => answer.timeTaken || 0).filter((time) => time > 0);
  const avgTime = average(answerTimes);
  const stdTime = computeStdDev(answerTimes);
  const fastAnswers = answerTimes.filter((time) => time <= 10).length;
  const slowAnswers = answerTimes.filter((time) => time >= 35).length;

  return {
    avg_time: avgTime,
    std_time: stdTime,
    fast_slow_ratio: slowAnswers > 0 ? fastAnswers / slowAnswers : fastAnswers,
    tab_switches: sessionData.tabSwitches || 0,
    copy_attempts: sessionData.copyAttempts || 0,
    window_blur: sessionData.windowBlurCount || 0,
    hint_rate: 0,
    changed_answers: sessionData.changedAnswers || 0,
    total_questions: answers.length,
    past_avg_accuracy: diagnosticScore,
  };
};

router.post('/start', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.diagnosticCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Diagnostic already completed',
        data: {
          diagnosticScore: user.diagnosticScore,
          currentLevel: user.currentLevel,
        },
      });
    }

    const sessionInfo = await adaptiveDiagnosticService.createSession(user._id.toString(), {
      institutionId: user.institutionId ? String(user.institutionId) : null,
      currentStreak: user.currentStreak || 0,
    });
    const activeSession = adaptiveDiagnosticService.activeSessions.get(sessionInfo.token);

    await DiagnosticSession.create({
      userId: user._id,
      sessionToken: sessionInfo.token,
      totalQuestions: sessionInfo.totalQuestions,
      minQuestions: sessionInfo.minQuestions,
      maxQuestions: sessionInfo.maxQuestions,
      timePerQuestion: sessionInfo.timePerQuestion,
      answeredCount: 0,
      topicsCovered: [...new Set(activeSession.plan.map((item) => item.topic))],
      questionPlan: activeSession.plan.map((item) => ({
        topic: item.topic,
        difficulty: item.difficulty,
        source: item.sourceId ? 'db' : 'pool',
        sourceId: item.sourceId || '',
        questionIndex: item.variantIndex || 0,
      })),
      expiresAt: new Date(Date.now() + SESSION_EXPIRY_MS),
    });

    res.json({
      success: true,
      data: {
        token: sessionInfo.token,
        minQuestions: sessionInfo.minQuestions,
        maxQuestions: sessionInfo.maxQuestions,
        totalQuestions: sessionInfo.totalQuestions,
        timePerQuestion: sessionInfo.timePerQuestion,
        expiresIn: sessionInfo.expiresIn,
      },
      message: 'Diagnostic session started',
    });
  } catch (error) {
    console.error('Diagnostic start error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

router.post('/question', protect, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    const question = await adaptiveDiagnosticService.generateNextQuestion(token);
    res.json({
      success: true,
      data: question,
      message: 'Next question retrieved',
    });
  } catch (error) {
    if (['Session not found', 'Session expired', 'All questions already answered'].includes(error.message)) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Diagnostic question error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/answer', protect, async (req, res) => {
  try {
    const { token, selectedOption, timeTaken } = req.body;
    if (!token || selectedOption === undefined) {
      return res.status(400).json({ success: false, message: 'Token and selectedOption are required' });
    }

    const result = await adaptiveDiagnosticService.submitAnswer(token, selectedOption, timeTaken || 0);
    const activeSession = adaptiveDiagnosticService.activeSessions.get(token);

    await DiagnosticSession.findOneAndUpdate(
      { sessionToken: token },
      {
        $set: {
          totalQuestions: activeSession?.plan?.length || MIN_QUESTIONS,
        },
        $inc: { answeredCount: 1 },
        $push: {
          answers: {
            topic: result.topic,
            difficulty: result.difficulty,
            isCorrect: result.isCorrect,
            selectedOption: result.selectedOption,
            timeTaken: result.timeTaken,
            wasTimedOut: result.selectedOption === -1,
          },
        },
      }
    );

    res.json({
      success: true,
      data: result,
      message: 'Answer submitted',
    });
  } catch (error) {
    if (['Session not found', 'Session expired', 'No question loaded'].includes(error.message)) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Diagnostic answer error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/complete', protect, async (req, res) => {
  try {
    const { token, sessionData = {}, monitoringSessionId } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    let results;
    try {
      results = adaptiveDiagnosticService.completeSession(token);
    } catch (completeError) {
      if (!['Session not found', 'Session expired'].includes(completeError.message)) {
        throw completeError;
      }

      const persistedSession = await DiagnosticSession.findOne({ sessionToken: token }).lean();
      if (!persistedSession?.answers?.length) {
        throw completeError;
      }
      results = {
        ...buildResults(persistedSession.answers),
        answers: persistedSession.answers,
      };
    }

    let level = 'Beginner';
    let confidence = results.latestAdaptiveConfidence || 0;
    try {
      const perfData = buildDiagnosticPerformanceData(results, req.user.currentStreak || 0);
      const mlResult = await classifyLevel(perfData);
      level = normalizeLevelFromScore(mlResult?.level, results.totalScore);
      confidence = Number(mlResult?.confidence || confidence || 0);
    } catch (error) {
      const score = results.totalScore;
      if (score >= 70) level = 'Placement-Ready';
      else if (score >= 50) level = 'Intermediate';
    }

    if (!ALLOWED_LEVELS.includes(level)) {
      level = 'Beginner';
    }

    const readinessPayload = {};
    Object.entries(results.perTopicScores || {}).forEach(([topic, score]) => {
      readinessPayload[topic] = Math.round(score);
    });

    let readinessScore = 0;
    try {
      const readinessResult = await getReadinessScore(readinessPayload);
      readinessScore = Number(readinessResult?.readiness_score || 0);
    } catch (error) {
      readinessScore = Math.round(results.totalScore);
    }

    let heuristicResult = { riskLevel: 'NONE', riskScore: 0 };
    let mlCheating = null;

    const persistedSession = await DiagnosticSession.findOneAndUpdate(
      { sessionToken: token },
      {
        status: 'completed',
        totalQuestions: results.totalQuestions,
        result: {
          totalScore: results.totalScore,
          perTopicScores: results.perTopicScores,
          avgTimePerQuestion: results.avgTimePerQuestion,
          assignedLevel: level,
          mlConfidence: confidence,
          readinessScore,
          unansweredCount: results.unansweredCount,
          malpractice: {
            riskLevel: heuristicResult.riskLevel,
            riskScore: heuristicResult.riskScore,
            cheatingProbability: Number(mlCheating?.cheating_probability || 0),
          },
        },
      },
      { new: true }
    );

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        diagnosticCompleted: true,
        diagnosticScore: results.totalScore,
        currentLevel: level,
        placementReadiness: readinessScore,
        isProfileComplete: true,
      },
      { new: true }
    );

    let malpracticeSummary = null;
    if (monitoringSessionId) {
      try {
        const monitoringSession = await MonitoringSession.findOne({
          _id: monitoringSessionId,
          userId: req.user._id,
        });

        if (monitoringSession) {
          await finalizeSession(monitoringSession, {
            browserMetrics: sessionData || {},
          });

          malpracticeSummary = {
            monitoringSessionId: monitoringSession._id,
            warningCount: monitoringSession.warningCount || 0,
            warningLimit: monitoringSession.warningLimit || 0,
            finalFlagged: !!monitoringSession.finalFlagged,
            riskLevel: monitoringSession.riskLevel || 'NONE',
            signals: monitoringSession.signals || [],
          };
        }
      } catch (monitoringErr) {
        console.error('Diagnostic monitoring finalization failed:', monitoringErr);
      }
    } else if (user?.institutionId) {
      const cheatingPayload = buildCheatingPayload(sessionData, results.answers || [], results.totalScore);
      heuristicResult = antiMalpractice.analyzeSession({
        answers: (results.answers || []).map((answer) => ({
          questionId: answer.questionId || answer.topic,
          selectedOption: answer.selectedOption,
          timeToAnswer: answer.timeTaken,
        })),
        tabSwitches: sessionData.tabSwitches || 0,
        copyAttempts: sessionData.copyAttempts || 0,
        windowBlurCount: sessionData.windowBlurCount || 0,
        changedAnswers: sessionData.changedAnswers || 0,
        ipAddress: req.ip,
      });
      mlCheating = await getCheatingRisk(cheatingPayload);

      const saved = await antiMalpractice.saveIfSuspicious(
        heuristicResult,
        req.user._id,
        persistedSession?._id,
        user.institutionId,
        {
          ...sessionData,
          answers: (results.answers || []).map((answer) => ({
            timeToAnswer: answer.timeTaken,
            selectedOption: answer.selectedOption,
          })),
          ipAddress: req.ip,
        },
        mlCheating
      );

      malpracticeSummary = {
        riskLevel: heuristicResult.riskLevel,
        riskScore: heuristicResult.riskScore,
        cheatingProbability: Number(mlCheating?.cheating_probability || 0),
        saved: saved.saved,
      };
    }

    let roadmapCreated = false;
    let planType = '';
    try {
      const { roadmap } = await generateRoadmap(req.user._id, level);
      roadmapCreated = true;
      planType = roadmap.planType;
    } catch (error) {
      console.error('Roadmap generation failed:', error.message);
    }

    await logActivity(
      req.user._id,
      1,
      Math.round((results.avgTimePerQuestion * results.totalQuestions) / 60),
      ['Diagnostic']
    );

    res.json({
      success: true,
      data: {
        score: results.totalScore,
        accuracy: Math.round(results.totalScore),
        correctAnswers: results.totalCorrect,
        totalQuestions: results.totalQuestions,
        totalQuestionsAsked: results.totalQuestions,
        minQuestions: MIN_QUESTIONS,
        maxQuestions: MAX_QUESTIONS,
        timePerQuestion: QUESTION_TIME_LIMIT,
        avgTimePerQuestion: results.avgTimePerQuestion,
        level,
        confidence,
        perTopicScores: results.perTopicScores,
        readinessScore,
        placementReadiness: readinessScore,
        roadmapCreated,
        planType,
        malpractice: malpracticeSummary,
      },
      message: 'Diagnostic completed',
    });
  } catch (error) {
    if (error.message === 'Session not found') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Diagnostic complete error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

module.exports = router;
