const MonitoringSession = require('../models/MonitoringSession');
const mlService = require('../services/mlService');
const {
  addEvent,
  addWarning,
  applyRisk,
  closeActiveSessionsForUser,
  finalizeSession,
  getBrowserAnalysis,
  mergeBrowserMetrics,
  normalizeWarningLimit,
  summarizeVisionFindings,
  uniqueStrings,
} = require('../services/monitoringService');

const buildSessionResponse = (session, extra = {}) => ({
  monitoringSessionId: session._id,
  warningCount: session.warningCount || 0,
  warningLimit: session.warningLimit || 0,
  finalFlagged: !!session.finalFlagged,
  riskLevel: session.riskLevel || 'NONE',
  riskScore: session.riskScore || 0,
  signals: session.signals || [],
  finalStatus: session.finalStatus || 'clean',
  ...extra,
});

const ensureOwnedActiveSession = async (req, res) => {
  const session = await MonitoringSession.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!session) {
    res.status(404).json({ success: false, message: 'Monitoring session not found' });
    return null;
  }

  return session;
};

const startMonitoringSession = async (req, res, next) => {
  try {
    const { sessionType, topicId, moduleId, problemId, deviceType, previewEnabled } = req.body;

    if (!['assessment', 'coding', 'diagnostic'].includes(sessionType)) {
      return res.status(400).json({
        success: false,
        message: 'sessionType must be assessment, coding, or diagnostic',
      });
    }

    if (sessionType === 'assessment' && (!topicId || !moduleId)) {
      return res.status(400).json({
        success: false,
        message: 'topicId and moduleId are required for assessment monitoring',
      });
    }

    if (sessionType === 'coding' && !problemId) {
      return res.status(400).json({
        success: false,
        message: 'problemId is required for coding monitoring',
      });
    }

    await closeActiveSessionsForUser(req.user._id, sessionType);

    const session = await MonitoringSession.create({
      userId: req.user._id,
      institutionId: req.user.institutionId || null,
      sessionType,
      topicId: topicId || null,
      moduleId: moduleId || null,
      problemId: problemId || null,
      deviceType: ['desktop', 'mobile'].includes(deviceType) ? deviceType : 'unknown',
      previewEnabled: !!previewEnabled,
      warningLimit: normalizeWarningLimit(req.user),
      startedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      data: buildSessionResponse(session),
    });
  } catch (err) {
    next(err);
  }
};

const recordMonitoringEvents = async (req, res, next) => {
  try {
    const session = await ensureOwnedActiveSession(req, res);
    if (!session) return;

    const { browserMetrics, events = [] } = req.body;

    if (session.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Monitoring session is already finished',
      });
    }

    if (browserMetrics) {
      mergeBrowserMetrics(session, browserMetrics);
      const browserAnalysis = getBrowserAnalysis(session);
      applyRisk(session, {
        source: 'browser',
        riskLevel: browserAnalysis.riskLevel,
        riskScore: browserAnalysis.riskScore,
        signals: browserAnalysis.flags,
      });

      if ((browserAnalysis.flags || []).length > 0) {
        addEvent(session, {
          source: 'browser',
          type: 'browser_metrics',
          riskLevel: browserAnalysis.riskLevel,
          message: browserAnalysis.reasons?.join('; ') || 'Browser monitoring event detected.',
          metadata: {
            ...session.browserMetrics,
            flags: browserAnalysis.flags,
          },
        });
      }

      if (browserAnalysis.riskLevel === 'MEDIUM' || browserAnalysis.riskLevel === 'HIGH') {
        addWarning(session, {
          source: 'browser',
          riskLevel: browserAnalysis.riskLevel,
          message: browserAnalysis.reasons?.[0] || 'Repeated browser monitoring signals detected.',
          signals: browserAnalysis.flags,
        });
      }
    }

    (events || []).forEach((event) => {
      addEvent(session, {
        source: event.source || 'browser',
        type: event.type || 'event',
        riskLevel: event.riskLevel || 'LOW',
        message: event.message || '',
        metadata: event.metadata || {},
      });
    });

    session.finalStatus = session.finalFlagged ? 'flagged' : session.warningCount > 0 ? 'warned' : session.finalStatus;
    await session.save();

    res.status(200).json({
      success: true,
      data: buildSessionResponse(session),
    });
  } catch (err) {
    next(err);
  }
};

const analyzeMonitoringFrame = async (req, res, next) => {
  try {
    const session = await ensureOwnedActiveSession(req, res);
    if (!session) return;

    if (session.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Monitoring session is already finished',
      });
    }

    const { imageData, metadata = {} } = req.body;
    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: 'imageData is required',
      });
    }

    const result = await mlService.analyzeProctorFrame({
      imageData,
      metadata: {
        ...metadata,
        sessionType: session.sessionType,
      },
    });

    const detections = result?.detections || {};
    const alerts = Array.isArray(result?.alerts) ? result.alerts : [];
    const signals = uniqueStrings([
      ...(result?.signals || []),
      ...alerts.map((alert) => alert.code),
    ]);

    summarizeVisionFindings(session, detections, result?.confidence || 0);
    applyRisk(session, {
      source: alerts.length > 0 ? 'combined' : 'vision',
      riskLevel: result?.riskLevel || 'LOW',
      riskScore: result?.riskScore || 0,
      signals,
    });

    alerts.forEach((alert) => {
      addEvent(session, {
        source: 'vision',
        type: alert.code || 'vision_alert',
        riskLevel: alert.severity || result?.riskLevel || 'LOW',
        message: alert.message || 'Vision monitoring alert detected.',
        metadata: {
          confidence: alert.confidence || 0,
          detections,
        },
      });
    });

    if (result?.warningSuggested) {
      addWarning(session, {
        source: session.sourceFlags?.includes('browser') ? 'combined' : 'vision',
        riskLevel: result?.riskLevel || 'MEDIUM',
        message: alerts[0]?.message || 'Suspicious behavior detected by camera monitoring.',
        signals,
      });
    }

    session.lastAnalyzedAt = new Date();
    session.finalStatus = session.finalFlagged ? 'flagged' : session.warningCount > 0 ? 'warned' : session.finalStatus;
    await session.save();

    res.status(200).json({
      success: true,
      data: buildSessionResponse(session, {
        alerts,
        detections,
      }),
    });
  } catch (err) {
    next(err);
  }
};

const finishMonitoringSession = async (req, res, next) => {
  try {
    const session = await ensureOwnedActiveSession(req, res);
    if (!session) return;

    if (session.status === 'finished') {
      return res.status(200).json({
        success: true,
        data: buildSessionResponse(session),
      });
    }

    await finalizeSession(session, req.body || {});

    res.status(200).json({
      success: true,
      data: buildSessionResponse(session),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  analyzeMonitoringFrame,
  finishMonitoringSession,
  recordMonitoringEvents,
  startMonitoringSession,
};
