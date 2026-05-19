const mongoose = require('mongoose');
const User = require('../models/User');
const MalpracticeLog = require('../models/MalpracticeLog');
const MonitoringEvidence = require('../models/MonitoringEvidence');

const LOCK_DURATION_MS = 2 * 60 * 60 * 1000;
const EVIDENCE_RETENTION_DAYS = 30;
const MAX_IMAGE_BYTES = 200 * 1024;
const ALLOWED_SESSION_TYPES = new Set(['assessment', 'diagnostic']);
const ALLOWED_VIOLATION_TYPES = new Set([
  'gaze_away',
  'multiple_faces',
  'mobile_detected',
  'tab_switch',
  'copy_attempt',
  'behavioral_anomaly',
]);

const VIOLATION_TRIGGER_CODES = {
  gaze_away: 'GAZE_AWAY',
  multiple_faces: 'MULTIPLE_FACES',
  mobile_detected: 'PHONE_VISIBLE',
  tab_switch: 'TAB_SWITCH',
  copy_attempt: 'COPY_ATTEMPT',
  behavioral_anomaly: 'BEHAVIORAL_ANOMALY',
};

const normalizeConfidence = (value) => {
  const numeric = Number(value || 0);
  if (Number.isNaN(numeric) || numeric <= 0) return 0;
  return numeric > 1 ? Math.min(numeric / 100, 1) : Math.min(numeric, 1);
};

const formatDuration = (ms) => {
  const safe = Math.max(0, Math.floor(Number(ms || 0) / 1000));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
};

const clearAssessmentLock = (user) => {
  user.assessmentLock = {
    isLocked: false,
    lockedUntil: null,
    lockReason: '',
    lockCount: Number(user.assessmentLock?.lockCount || 0),
  };
};

const buildLockResponse = (user, now = Date.now()) => {
  const lock = user.assessmentLock || {};
  const lockedUntilTime = lock.lockedUntil ? new Date(lock.lockedUntil).getTime() : 0;
  const active = Boolean(lock.isLocked && lockedUntilTime > now);
  const timeRemainingMs = active ? Math.max(0, lockedUntilTime - now) : 0;

  return {
    isLocked: active,
    lockedUntil: active ? lock.lockedUntil : null,
    timeRemainingMs,
    timeRemainingFormatted: active ? formatDuration(timeRemainingMs) : '0h 0m 0s',
    lockReason: active ? (lock.lockReason || '') : '',
    lockCount: Number(lock.lockCount || 0),
  };
};

const decodeBase64Image = (value) => {
  if (!value || typeof value !== 'string') return null;

  const raw = value.trim();
  if (!raw) return null;

  const matched = raw.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  const base64Payload = matched ? matched[2] : raw;
  const contentType = matched ? matched[1] : 'image/jpeg';

  try {
    const buffer = Buffer.from(base64Payload, 'base64');
    return {
      buffer,
      contentType,
      byteLength: buffer.length,
      dataUrl: matched ? raw : `data:${contentType};base64,${base64Payload}`,
    };
  } catch (_error) {
    return null;
  }
};

const buildEvidenceExpiry = (capturedAt = new Date()) =>
  new Date(capturedAt.getTime() + (EVIDENCE_RETENTION_DAYS * 24 * 60 * 60 * 1000));

const shouldLockForViolation = ({ violationType, warningNumber, sessionData = {} }) => {
  if (violationType === 'mobile_detected') {
    return true;
  }

  if (violationType === 'copy_attempt') {
    return Number(sessionData.copyAttempts || 0) >= 5 || Number(warningNumber || 0) >= 5;
  }

  if (violationType === 'tab_switch') {
    return Number(sessionData.tabSwitches || 0) >= 3 || Number(warningNumber || 0) >= 3;
  }

  if (violationType === 'gaze_away') {
    return Number(sessionData.gazeWarnings || 0) >= 3 || Number(warningNumber || 0) >= 3;
  }

  if (violationType === 'multiple_faces') {
    return Number(sessionData.faceWarnings || 0) >= 3 || Number(warningNumber || 0) >= 3;
  }

  return Number(warningNumber || 0) >= 3;
};

const deriveRiskLevel = ({ violationType, warningNumber, sessionData = {} }) => {
  if (violationType === 'mobile_detected') {
    return 'HIGH';
  }

  if (violationType === 'multiple_faces') {
    return Number(warningNumber || 0) >= 3 ? 'HIGH' : 'MEDIUM';
  }

  if (violationType === 'tab_switch') {
    return Number(sessionData.tabSwitches || 0) >= 3 ? 'HIGH' : 'LOW';
  }

  if (violationType === 'copy_attempt') {
    if (Number(sessionData.copyAttempts || 0) >= 5 || Number(warningNumber || 0) >= 5) {
      return 'HIGH';
    }
    return Number(warningNumber || 0) >= 3 ? 'MEDIUM' : 'LOW';
  }

  if (violationType === 'gaze_away') {
    if (Number(sessionData.gazeWarnings || 0) >= 3 || Number(warningNumber || 0) >= 3) {
      return 'HIGH';
    }
    return Number(warningNumber || 0) >= 2 ? 'MEDIUM' : 'LOW';
  }

  return Number(warningNumber || 0) >= 3 ? 'HIGH' : 'MEDIUM';
};

const persistEvidenceForLog = async ({
  log,
  user,
  imageData,
  sessionType,
  violationType,
  riskLevel,
  confidence,
}) => {
  const parsed = decodeBase64Image(imageData);
  if (!parsed || !parsed.buffer?.length || parsed.byteLength > MAX_IMAGE_BYTES) {
    return {
      storedOnLog: false,
      storedInEvidence: false,
      evidenceCount: Number(log.evidenceCount || 0),
      latestEvidenceAt: log.latestEvidenceAt || null,
      latestEvidenceTrigger: log.latestEvidenceTrigger || '',
      hasEvidence: Boolean(log.hasEvidence),
    };
  }

  log.violationImage = parsed.dataUrl;

  if (!user.institutionId) {
    log.hasEvidence = false;
    log.evidenceCount = Number(log.evidenceCount || 0);
    return {
      storedOnLog: true,
      storedInEvidence: false,
      evidenceCount: Number(log.evidenceCount || 0),
      latestEvidenceAt: log.latestEvidenceAt || null,
      latestEvidenceTrigger: log.latestEvidenceTrigger || '',
      hasEvidence: false,
    };
  }

  const capturedAt = new Date();
  await MonitoringEvidence.create({
    monitoringSessionId: log.monitoringSessionId || null,
    malpracticeLogId: log._id,
    institutionId: user.institutionId,
    userId: user._id,
    sessionType,
    triggerCode: VIOLATION_TRIGGER_CODES[violationType] || String(violationType || 'MALPRACTICE').toUpperCase(),
    riskLevel,
    capturedAt,
    expiresAt: buildEvidenceExpiry(capturedAt),
    contentType: parsed.contentType === 'image/jpeg' ? 'image/jpeg' : 'image/jpeg',
    imageBuffer: parsed.buffer,
    width: 0,
    height: 0,
    modelSource: 'heuristic',
    confidence: normalizeConfidence(confidence),
  });

  const evidenceCount = await MonitoringEvidence.countDocuments({ malpracticeLogId: log._id });
  log.hasEvidence = true;
  log.evidenceCount = evidenceCount;
  log.latestEvidenceAt = capturedAt;
  log.latestEvidenceTrigger = VIOLATION_TRIGGER_CODES[violationType] || String(violationType || '').toUpperCase();

  return {
    storedOnLog: true,
    storedInEvidence: true,
    evidenceCount,
    latestEvidenceAt: capturedAt,
    latestEvidenceTrigger: log.latestEvidenceTrigger,
    hasEvidence: true,
  };
};

const sanitizeSessionData = (sessionData = {}) => ({
  ipAddress: '',
  tabSwitches: Number(sessionData.tabSwitches || 0),
  copyAttempts: Number(sessionData.copyAttempts || 0),
  windowBlurCount: Number(sessionData.windowBlurCount || 0),
  gazeWarnings: Number(sessionData.gazeWarnings || 0),
  faceWarnings: Number(sessionData.faceWarnings || 0),
  deviceDetections: Number(sessionData.deviceDetections || 0),
  avgAnswerTime: Number(sessionData.avgAnswerTime || 0),
  timingStdDev: Number(sessionData.timingStdDev || 0),
  totalQuestions: Number(sessionData.totalQuestions || 0),
  changedAnswers: Number(sessionData.changedAnswers || 0),
});

const normalizePagination = (page, limit) => {
  const safePage = Math.max(1, Number(page || 1));
  const safeLimit = Math.min(100, Math.max(1, Number(limit || 20)));
  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
};

const checkLockStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const lockState = buildLockResponse(user);
    if (!lockState.isLocked && user.assessmentLock?.isLocked) {
      clearAssessmentLock(user);
      await user.save();
    }

    return res.json(lockState);
  } catch (error) {
    return next(error);
  }
};

const reportViolation = async (req, res, next) => {
  try {
    const {
      violationType,
      confidence,
      detectedObject = '',
      violationImage = '',
      sessionType,
      assessmentId = '',
      topicId = null,
      warningNumber = 0,
      sessionData = {},
    } = req.body || {};

    if (!ALLOWED_VIOLATION_TYPES.has(violationType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid violationType',
      });
    }

    if (!ALLOWED_SESSION_TYPES.has(sessionType)) {
      return res.status(400).json({
        success: false,
        message: 'sessionType must be assessment or diagnostic',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const now = Date.now();
    const currentLock = buildLockResponse(user, now);
    if (!currentLock.isLocked && user.assessmentLock?.isLocked) {
      clearAssessmentLock(user);
    }

    const normalizedSessionData = sanitizeSessionData(sessionData);
    const normalizedConfidence = normalizeConfidence(confidence);
    const riskLevel = deriveRiskLevel({
      violationType,
      warningNumber,
      sessionData: normalizedSessionData,
    });

    const lockApplied = shouldLockForViolation({
      violationType,
      warningNumber,
      sessionData: normalizedSessionData,
    });

    const logPayload = {
      userId: user._id,
      institutionId: user.institutionId || null,
      sessionType,
      assessmentReference: String(assessmentId || ''),
      violationType,
      confidence: normalizedConfidence,
      detectedObject: String(detectedObject || '').trim(),
      warningNumber: Number(warningNumber || 0),
      resultedInLock: lockApplied,
      riskLevel,
      riskScore: normalizedConfidence,
      flags: [String(violationType).toUpperCase()],
      reasons: [String(violationType).replace(/_/g, ' ')],
      sourceFlags: ['browser', 'vision'],
      finalFlagged: lockApplied,
      warningCount: Number(warningNumber || 0),
      warningLimit: violationType === 'copy_attempt' ? 5 : 3,
      sessionData: normalizedSessionData,
      hasEvidence: false,
      evidenceCount: 0,
      latestEvidenceAt: null,
      latestEvidenceTrigger: '',
    };

    if (topicId && mongoose.Types.ObjectId.isValid(topicId)) {
      logPayload.topicId = topicId;
    }

    if (assessmentId && mongoose.Types.ObjectId.isValid(assessmentId)) {
      logPayload.assessmentId = assessmentId;
    }

    const log = await MalpracticeLog.create(logPayload);
    await persistEvidenceForLog({
      log,
      user,
      imageData: violationImage,
      sessionType,
      violationType,
      riskLevel,
      confidence: normalizedConfidence,
    });

    if (lockApplied) {
      user.assessmentLock = {
        isLocked: true,
        lockedUntil: new Date(now + LOCK_DURATION_MS),
        lockReason: violationType,
        lockCount: Number(user.assessmentLock?.lockCount || 0) + 1,
      };
    }

    await Promise.all([log.save(), user.save()]);
    const lockState = buildLockResponse(user, Date.now());

    return res.json({
      success: true,
      isLocked: lockState.isLocked,
      lockApplied,
      warningNumber: Number(warningNumber || 0),
      riskLevel,
      lockedUntil: lockState.lockedUntil,
      timeRemainingMs: lockState.timeRemainingMs,
      timeRemainingFormatted: lockState.timeRemainingFormatted,
      lockReason: lockState.lockReason,
      lockCount: lockState.lockCount,
    });
  } catch (error) {
    return next(error);
  }
};

const unlockStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body || {};

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid studentId is required',
      });
    }

    const student = await User.findById(studentId);
    if (!student || String(student.institutionId || '') !== String(req.institution._id)) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    clearAssessmentLock(student);
    await student.save();

    return res.json({
      success: true,
      message: 'Student unlocked',
    });
  } catch (error) {
    return next(error);
  }
};

const getInstitutionMalpracticeLogs = async (req, res, next) => {
  try {
    const { page, limit, riskLevel, violationType, search = '', from = '', to = '' } = req.query || {};
    const paging = normalizePagination(page, limit);
    const query = {
      institutionId: req.institution._id,
    };

    if (riskLevel && riskLevel !== 'ALL') {
      query.riskLevel = String(riskLevel).toUpperCase();
    }

    if (violationType && violationType !== 'all') {
      query.violationType = String(violationType);
    }

    if (from || to) {
      query.createdAt = {};
      if (from) {
        query.createdAt.$gte = new Date(from);
      }
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      const users = await User.find({
        institutionId: req.institution._id,
        $or: [
          { name: regex },
          { username: regex },
          { email: regex },
        ],
      }).select('_id');

      const ids = users.map((item) => item._id);
      query.userId = ids.length ? { $in: ids } : { $in: [] };
    }

    const [totalCount, logs] = await Promise.all([
      MalpracticeLog.countDocuments(query),
      MalpracticeLog.find(query)
        .populate('userId', 'name username email assessmentLock')
        .sort({ createdAt: -1, _id: -1 })
        .skip(paging.skip)
        .limit(paging.limit)
        .lean(),
    ]);

    const logIds = logs.map((log) => log._id);
    const latestEvidence = logIds.length
      ? await MonitoringEvidence.aggregate([
          {
            $match: {
              malpracticeLogId: { $in: logIds },
            },
          },
          { $sort: { capturedAt: -1, _id: -1 } },
          {
            $group: {
              _id: '$malpracticeLogId',
              evidenceId: { $first: '$_id' },
              capturedAt: { $first: '$capturedAt' },
            },
          },
        ])
      : [];

    const evidenceMap = new Map(
      latestEvidence.map((item) => [String(item._id), item])
    );
    const now = Date.now();

    const responseLogs = logs.map((log) => {
      const userLock = log.userId?.assessmentLock || {};
      const lockedUntilTime = userLock.lockedUntil ? new Date(userLock.lockedUntil).getTime() : 0;
      const evidence = evidenceMap.get(String(log._id));

      return {
        _id: log._id,
        userId: log.userId
          ? {
              _id: log.userId._id,
              name: log.userId.name || log.userId.username || 'Unknown Student',
              username: log.userId.username || '',
              email: log.userId.email || '',
            }
          : null,
        violationType: log.violationType || null,
        confidence: Number(log.confidence || 0),
        detectedObject: log.detectedObject || '',
        riskLevel: log.riskLevel,
        resultedInLock: Boolean(log.resultedInLock),
        warningNumber: Number(log.warningNumber || log.warningCount || 0),
        createdAt: log.createdAt,
        sessionType: log.sessionType,
        sessionData: log.sessionData || {},
        hasEvidence: Boolean(log.hasEvidence || evidence),
        evidenceCount: Number(log.evidenceCount || 0),
        latestEvidenceId: evidence?.evidenceId || null,
        latestEvidenceAt: evidence?.capturedAt || log.latestEvidenceAt || null,
        isCurrentlyLocked: Boolean(userLock.isLocked && lockedUntilTime > now),
        lockedUntil: userLock.lockedUntil || null,
        lockReason: userLock.lockReason || '',
        lockCount: Number(userLock.lockCount || 0),
      };
    });

    return res.json({
      success: true,
      logs: responseLogs,
      totalCount,
      currentPage: paging.page,
      totalPages: Math.max(1, Math.ceil(totalCount / paging.limit)),
    });
  } catch (error) {
    return next(error);
  }
};

const getInstitutionMalpracticeStats = async (req, res, next) => {
  try {
    const institutionId = req.institution._id;
    const now = new Date();

    const [
      totalViolations,
      highRiskCount,
      mobileDetections,
      tabSwitchCount,
      lockedStudentsCount,
      topOffendersRaw,
      recentAlerts,
    ] = await Promise.all([
      MalpracticeLog.countDocuments({ institutionId }),
      MalpracticeLog.countDocuments({ institutionId, riskLevel: 'HIGH' }),
      MalpracticeLog.countDocuments({ institutionId, violationType: 'mobile_detected' }),
      MalpracticeLog.countDocuments({ institutionId, violationType: 'tab_switch' }),
      User.countDocuments({
        institutionId,
        'assessmentLock.isLocked': true,
        'assessmentLock.lockedUntil': { $gt: now },
      }),
      MalpracticeLog.aggregate([
        { $match: { institutionId } },
        {
          $group: {
            _id: '$userId',
            violationCount: { $sum: 1 },
          },
        },
        { $sort: { violationCount: -1, _id: 1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 0,
            userId: '$user._id',
            username: { $ifNull: ['$user.name', '$user.username'] },
            violationCount: 1,
          },
        },
      ]),
      MalpracticeLog.find({ institutionId })
        .populate('userId', 'name username email')
        .sort({ createdAt: -1, _id: -1 })
        .limit(5)
        .lean(),
    ]);

    return res.json({
      success: true,
      totalViolations,
      highRiskCount,
      lockedStudentsCount,
      mobileDetections,
      tabSwitchCount,
      topOffenders: topOffendersRaw,
      recentAlerts: recentAlerts.map((log) => ({
        _id: log._id,
        userId: log.userId
          ? {
              _id: log.userId._id,
              name: log.userId.name || log.userId.username || 'Unknown Student',
              username: log.userId.username || '',
              email: log.userId.email || '',
            }
          : null,
        violationType: log.violationType || null,
        riskLevel: log.riskLevel,
        createdAt: log.createdAt,
        resultedInLock: Boolean(log.resultedInLock),
      })),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  checkLockStatus,
  getInstitutionMalpracticeLogs,
  getInstitutionMalpracticeStats,
  reportViolation,
  unlockStudent,
};
