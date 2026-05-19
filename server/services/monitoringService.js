const MonitoringSession = require('../models/MonitoringSession');
const MalpracticeLog = require('../models/MalpracticeLog');
const MonitoringEvidence = require('../models/MonitoringEvidence');
const antiMalpractice = require('./antiMalpractice');

const RISK_ORDER = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

const WARNING_COOLDOWN_MS = 25 * 1000;
const EVIDENCE_COOLDOWN_MS = 30 * 1000;
const EVIDENCE_RETENTION_DAYS = 30;
const FACE_MISSING_EVIDENCE_CONFIDENCE_THRESHOLD = Number(
  process.env.MONITORING_FACE_MISSING_EVIDENCE_CONFIDENCE || 0.7
);
const EVIDENCE_TRIGGER_PRIORITY = [
  'MULTIPLE_FACES',
  'PHONE_VISIBLE',
  'EXTRA_SCREEN_VISIBLE',
  'FACE_MISSING',
];

const uniqueStrings = (values = []) => [...new Set((values || []).filter(Boolean).map(String))];

const maxRiskLevel = (left = 'NONE', right = 'NONE') =>
  (RISK_ORDER[right] || 0) > (RISK_ORDER[left] || 0) ? right : left;

const normalizeWarningLimit = () => 3;

const buildEvidenceExpiry = (capturedAt = new Date()) =>
  new Date(capturedAt.getTime() + (EVIDENCE_RETENTION_DAYS * 24 * 60 * 60 * 1000));

const decodeBase64ImageBuffer = (imageData) => {
  if (!imageData || typeof imageData !== 'string') return null;

  try {
    const encoded = imageData.includes(',') ? imageData.split(',', 2)[1] : imageData;
    return Buffer.from(encoded, 'base64');
  } catch (_error) {
    return null;
  }
};

const getSessionEvidenceStateValue = (session, triggerCode) => {
  if (!session?.evidenceCaptureState || !triggerCode) return null;

  if (typeof session.evidenceCaptureState.get === 'function') {
    return session.evidenceCaptureState.get(triggerCode) || null;
  }

  return session.evidenceCaptureState[triggerCode] || null;
};

const setSessionEvidenceStateValue = (session, triggerCode, capturedAt) => {
  if (!session || !triggerCode || !capturedAt) return;

  if (!session.evidenceCaptureState || typeof session.evidenceCaptureState.get !== 'function') {
    session.evidenceCaptureState = new Map(
      Object.entries(session.evidenceCaptureState || {})
    );
  }

  session.evidenceCaptureState.set(triggerCode, capturedAt);
  if (typeof session.markModified === 'function') {
    session.markModified('evidenceCaptureState');
  }
};

const getEvidenceSummaryForSession = async (monitoringSessionId) => {
  const [summary] = await MonitoringEvidence.aggregate([
    { $match: { monitoringSessionId } },
    { $sort: { capturedAt: -1, _id: -1 } },
    {
      $group: {
        _id: null,
        evidenceCount: { $sum: 1 },
        latestEvidenceAt: { $first: '$capturedAt' },
        latestEvidenceTrigger: { $first: '$triggerCode' },
      },
    },
  ]);

  return {
    evidenceCount: Number(summary?.evidenceCount || 0),
    latestEvidenceAt: summary?.latestEvidenceAt || null,
    latestEvidenceTrigger: summary?.latestEvidenceTrigger || '',
    hasEvidence: Number(summary?.evidenceCount || 0) > 0,
  };
};

const applyEvidenceSummaryToLog = async (logId, monitoringSessionId) => {
  if (!logId) return null;

  const summary = monitoringSessionId
    ? await getEvidenceSummaryForSession(monitoringSessionId)
    : {
        evidenceCount: 0,
        latestEvidenceAt: null,
        latestEvidenceTrigger: '',
        hasEvidence: false,
      };

  await MalpracticeLog.findByIdAndUpdate(logId, {
    $set: summary,
  });

  return summary;
};

const backfillEvidenceLogLink = async (monitoringSessionId, malpracticeLogId) => {
  if (!monitoringSessionId || !malpracticeLogId) return;

  await MonitoringEvidence.updateMany(
    {
      monitoringSessionId,
      $or: [
        { malpracticeLogId: null },
        { malpracticeLogId: { $ne: malpracticeLogId } },
      ],
    },
    {
      $set: {
        malpracticeLogId,
      },
    }
  );
};

const isEvidenceCooldownActive = (session, triggerCode, now = new Date()) => {
  const lastCaptureAt = getSessionEvidenceStateValue(session, triggerCode);
  if (!lastCaptureAt) return false;
  return (now.getTime() - new Date(lastCaptureAt).getTime()) < EVIDENCE_COOLDOWN_MS;
};

const qualifiesFaceMissingEvidence = (session, alert = {}, confidence = 0) => {
  const previousDetections = session?.visionFindings?.latestDetections || {};
  const previousFaceMissing = !!previousDetections.faceMissing;
  const nextConfidence = Number(alert.confidence ?? confidence ?? 0);

  return previousFaceMissing || nextConfidence >= FACE_MISSING_EVIDENCE_CONFIDENCE_THRESHOLD;
};

const selectEvidenceTrigger = (session, alerts = [], confidence = 0) => {
  const byCode = new Map((alerts || []).map((alert) => [alert.code, alert]));
  const now = new Date();

  for (const triggerCode of EVIDENCE_TRIGGER_PRIORITY) {
    const alert = byCode.get(triggerCode);
    if (!alert) continue;

    if (
      triggerCode === 'FACE_MISSING' &&
      !qualifiesFaceMissingEvidence(session, alert, confidence)
    ) {
      continue;
    }

    if (isEvidenceCooldownActive(session, triggerCode, now)) {
      continue;
    }

    return { alert, triggerCode, capturedAt: now };
  }

  return null;
};

const captureMonitoringEvidence = async ({
  session,
  alerts = [],
  imageData,
  metadata = {},
  riskLevel = 'LOW',
  confidence = 0,
  modelSource = 'heuristic',
}) => {
  if (!session?.institutionId) {
    return {
      evidenceCaptured: false,
      evidenceTrigger: null,
      evidenceCount: 0,
    };
  }

  const trigger = selectEvidenceTrigger(session, alerts, confidence);
  if (!trigger) {
    const summary = await getEvidenceSummaryForSession(session._id);
    return {
      evidenceCaptured: false,
      evidenceTrigger: null,
      evidenceCount: summary.evidenceCount,
    };
  }

  const imageBuffer = decodeBase64ImageBuffer(imageData);
  if (!imageBuffer?.length) {
    const summary = await getEvidenceSummaryForSession(session._id);
    return {
      evidenceCaptured: false,
      evidenceTrigger: null,
      evidenceCount: summary.evidenceCount,
    };
  }

  const existingLog = await MalpracticeLog.findOne({
    monitoringSessionId: session._id,
  }).select('_id monitoringSessionId');

  await MonitoringEvidence.create({
    monitoringSessionId: session._id,
    malpracticeLogId: existingLog?._id || null,
    institutionId: session.institutionId,
    userId: session.userId,
    sessionType: session.sessionType,
    triggerCode: trigger.triggerCode,
    riskLevel: String(trigger.alert?.severity || riskLevel || 'LOW').toUpperCase(),
    capturedAt: trigger.capturedAt,
    expiresAt: buildEvidenceExpiry(trigger.capturedAt),
    contentType: 'image/jpeg',
    imageBuffer,
    width: Number(metadata.width || 0),
    height: Number(metadata.height || 0),
    modelSource: modelSource === 'onnx' ? 'onnx' : 'heuristic',
    confidence: Number(trigger.alert?.confidence ?? confidence ?? 0),
  });

  setSessionEvidenceStateValue(session, trigger.triggerCode, trigger.capturedAt);

  const summary = await getEvidenceSummaryForSession(session._id);
  if (existingLog?._id) {
    await applyEvidenceSummaryToLog(existingLog._id, session._id);
  }

  return {
    evidenceCaptured: true,
    evidenceTrigger: trigger.triggerCode,
    evidenceCount: summary.evidenceCount,
  };
};

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
    phoneVisible: !!(session.visionFindings?.phoneVisible || detections.phoneVisible),
    extraScreenVisible: !!(session.visionFindings?.extraScreenVisible || detections.extraScreenVisible),
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

  const evidenceSummary = await getEvidenceSummaryForSession(session._id);

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
      phoneVisible: !!session.visionFindings?.phoneVisible,
      extraScreenVisible: !!session.visionFindings?.extraScreenVisible,
      faceCount: Number(session.visionFindings?.faceCount || 0),
      confidence: Number(session.visionFindings?.confidence || 0),
    },
    evidenceCount: evidenceSummary.evidenceCount,
    latestEvidenceAt: evidenceSummary.latestEvidenceAt,
    latestEvidenceTrigger: evidenceSummary.latestEvidenceTrigger,
    hasEvidence: evidenceSummary.hasEvidence,
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

  const log = await MalpracticeLog.findOneAndUpdate(
    { monitoringSessionId: session._id },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await backfillEvidenceLogLink(session._id, log._id);
  await applyEvidenceSummaryToLog(log._id, session._id);

  return log;
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
  applyEvidenceSummaryToLog,
  backfillEvidenceLogLink,
  buildMalpracticePayload,
  captureMonitoringEvidence,
  closeActiveSessionsForUser,
  EVIDENCE_COOLDOWN_MS,
  EVIDENCE_RETENTION_DAYS,
  FACE_MISSING_EVIDENCE_CONFIDENCE_THRESHOLD,
  finalizeSession,
  getBrowserAnalysis,
  getEvidenceSummaryForSession,
  maxRiskLevel,
  mergeBrowserMetrics,
  normalizeWarningLimit,
  selectEvidenceTrigger,
  summarizeVisionFindings,
  uniqueStrings,
  upsertMalpracticeLogForSession,
};
