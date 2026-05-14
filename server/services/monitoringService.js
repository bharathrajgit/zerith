const MonitoringSession = require('../models/MonitoringSession');
const MalpracticeLog = require('../models/MalpracticeLog');
const antiMalpractice = require('./antiMalpractice');

const RISK_ORDER = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

const WARNING_COOLDOWN_MS = 25 * 1000;

const uniqueStrings = (values = []) => [...new Set((values || []).filter(Boolean).map(String))];

const maxRiskLevel = (left = 'NONE', right = 'NONE') =>
  (RISK_ORDER[right] || 0) > (RISK_ORDER[left] || 0) ? right : left;

const normalizeWarningLimit = (user) => (user?.institutionId ? 2 : 3);

const mergeBrowserMetrics = (session, metrics = {}) => {
  const next = {
    tabSwitches: Number(metrics.tabSwitches || 0),
    copyAttempts: Number(metrics.copyAttempts || 0),
    windowBlurCount: Number(metrics.windowBlurCount || 0),
  };

  session.browserMetrics = {
    tabSwitches: Math.max(session.browserMetrics?.tabSwitches || 0, next.tabSwitches),
    copyAttempts: Math.max(session.browserMetrics?.copyAttempts || 0, next.copyAttempts),
    windowBlurCount: Math.max(session.browserMetrics?.windowBlurCount || 0, next.windowBlurCount),
  };
};

const shouldIssueWarning = (session, nextRiskLevel = 'LOW') => {
  if ((RISK_ORDER[nextRiskLevel] || 0) < RISK_ORDER.MEDIUM) return false;
  if (session.finalFlagged) return false;
  const lastWarning = session.warnings?.[session.warnings.length - 1];
  if (!lastWarning?.createdAt) return true;
  return (Date.now() - new Date(lastWarning.createdAt).getTime()) >= WARNING_COOLDOWN_MS;
};

const addEvent = (session, event) => {
  session.events.push({
    source: event.source || 'browser',
    type: event.type || 'event',
    riskLevel: event.riskLevel || 'LOW',
    message: event.message || '',
    metadata: event.metadata || {},
    createdAt: event.createdAt || new Date(),
  });
};

const addWarning = (session, warning) => {
  if (!shouldIssueWarning(session, warning.riskLevel || 'MEDIUM')) return false;

  session.warningCount += 1;
  session.warnings.push({
    source: warning.source || 'combined',
    riskLevel: warning.riskLevel || 'MEDIUM',
    message: warning.message || '',
    signals: uniqueStrings(warning.signals || []),
    createdAt: new Date(),
  });

  if (session.warningCount >= session.warningLimit) {
    session.finalFlagged = true;
  }

  return true;
};

const applyRisk = (session, { riskLevel = 'LOW', riskScore = 0, source, signals = [] }) => {
  session.riskLevel = maxRiskLevel(session.riskLevel, riskLevel);
  session.riskScore = Math.max(Number(session.riskScore || 0), Number(riskScore || 0));
  session.sourceFlags = uniqueStrings([...(session.sourceFlags || []), ...(source ? [source] : [])]);
  session.signals = uniqueStrings([...(session.signals || []), ...signals]);
};

const summarizeVisionFindings = (session, detections = {}, confidence = 0) => {
  session.visionFindings = {
    multipleFaces: !!(session.visionFindings?.multipleFaces || detections.multipleFaces),
    headPoseAway: !!(session.visionFindings?.headPoseAway || detections.headPoseAway),
    gazeAway: !!(session.visionFindings?.gazeAway || detections.gazeAway),
    faceMissing: !!(session.visionFindings?.faceMissing || detections.faceMissing),
    faceCount: Math.max(Number(session.visionFindings?.faceCount || 1), Number(detections.faceCount || 0)),
    confidence: Math.max(Number(session.visionFindings?.confidence || 0), Number(confidence || 0)),
    latestDetections: detections || {},
  };
};

const getBrowserAnalysis = (session) =>
  antiMalpractice.analyzeSession({
    answers: [],
    tabSwitches: session.browserMetrics?.tabSwitches || 0,
    copyAttempts: session.browserMetrics?.copyAttempts || 0,
    windowBlurCount: session.browserMetrics?.windowBlurCount || 0,
  });

const deriveSessionFinalStatus = (session) => {
  if (session.finalFlagged || session.riskLevel === 'HIGH') return 'flagged';
  if ((session.warningCount || 0) > 0 || session.riskLevel === 'MEDIUM') return 'warned';
  return 'clean';
};

const buildMalpracticePayload = (session) => {
  const browserAnalysis = getBrowserAnalysis(session);
  const reasons = uniqueStrings([
    ...(session.warnings || []).map((warning) => warning.message),
    ...(session.events || []).map((event) => event.message),
    ...(browserAnalysis.reasons || []),
  ]);
  const flags = uniqueStrings([
    ...(browserAnalysis.flags || []),
    ...(session.signals || []),
  ]);

  const sourceFlags = uniqueStrings([
    ...(session.sourceFlags || []),
    session.browserMetrics?.tabSwitches || session.browserMetrics?.copyAttempts || session.browserMetrics?.windowBlurCount ? 'browser' : '',
    session.visionFindings?.latestDetections && Object.keys(session.visionFindings.latestDetections).length ? 'vision' : '',
  ]).filter(Boolean);

  const combinedSource =
    sourceFlags.includes('browser') && sourceFlags.includes('vision')
      ? ['combined', ...sourceFlags]
      : sourceFlags;

  const riskLevel = maxRiskLevel(browserAnalysis.riskLevel, session.riskLevel || 'NONE');
  const riskScore = Math.max(Number(browserAnalysis.riskScore || 0), Number(session.riskScore || 0));

  return {
    shouldPersist: session.finalFlagged || riskLevel === 'HIGH' || riskLevel === 'MEDIUM' || (session.warningCount || 0) > 0,
    riskLevel,
    riskScore,
    flags,
    reasons,
    sourceFlags: uniqueStrings(combinedSource),
  };
};

const upsertMalpracticeLogForSession = async (session) => {
  const payload = buildMalpracticePayload(session);
  if (!payload.shouldPersist) return null;

  const update = {
    userId: session.userId,
    institutionId: session.institutionId || null,
    assessmentId: session.assessmentId || null,
    monitoringSessionId: session._id,
    sessionType: session.sessionType,
    topicId: session.topicId || null,
    moduleId: session.moduleId || null,
    problemId: session.problemId || null,
    riskLevel: payload.riskLevel,
    riskScore: payload.riskScore,
    flags: payload.flags,
    reasons: payload.reasons,
    sourceFlags: payload.sourceFlags,
    warningCount: session.warningCount || 0,
    warningLimit: session.warningLimit || 0,
    finalFlagged: !!session.finalFlagged,
    visionFindings: {
      multipleFaces: !!session.visionFindings?.multipleFaces,
      headPoseAway: !!session.visionFindings?.headPoseAway,
      gazeAway: !!session.visionFindings?.gazeAway,
      faceMissing: !!session.visionFindings?.faceMissing,
      faceCount: Number(session.visionFindings?.faceCount || 0),
      confidence: Number(session.visionFindings?.confidence || 0),
    },
    sessionData: {
      ipAddress: '',
      tabSwitches: Number(session.browserMetrics?.tabSwitches || 0),
      copyAttempts: Number(session.browserMetrics?.copyAttempts || 0),
      windowBlurCount: Number(session.browserMetrics?.windowBlurCount || 0),
      avgAnswerTime: 0,
      timingStdDev: 0,
      totalQuestions: 0,
      changedAnswers: 0,
    },
  };

  return MalpracticeLog.findOneAndUpdate(
    { monitoringSessionId: session._id },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const finalizeSession = async (session, finishPayload = {}) => {
  if (!session) return null;

  if (finishPayload.browserMetrics) {
    mergeBrowserMetrics(session, finishPayload.browserMetrics);
  }

  if (finishPayload.assessmentId) session.assessmentId = finishPayload.assessmentId;
  if (finishPayload.topicId) session.topicId = finishPayload.topicId;
  if (finishPayload.moduleId) session.moduleId = finishPayload.moduleId;
  if (finishPayload.problemId) session.problemId = finishPayload.problemId;

  session.status = 'finished';
  session.finishedAt = new Date();
  session.finalStatus = deriveSessionFinalStatus(session);
  await session.save();
  await upsertMalpracticeLogForSession(session);
  return session;
};

const closeActiveSessionsForUser = async (userId, sessionType) => {
  const activeSessions = await MonitoringSession.find({
    userId,
    sessionType,
    status: 'active',
  });

  for (const session of activeSessions) {
    await finalizeSession(session);
  }
};

module.exports = {
  addEvent,
  addWarning,
  applyRisk,
  buildMalpracticePayload,
  closeActiveSessionsForUser,
  finalizeSession,
  getBrowserAnalysis,
  maxRiskLevel,
  mergeBrowserMetrics,
  normalizeWarningLimit,
  summarizeVisionFindings,
  uniqueStrings,
  upsertMalpracticeLogForSession,
};
