const test = require('node:test');
const assert = require('node:assert/strict');

const MonitoringEvidence = require('../models/MonitoringEvidence');
const MalpracticeLog = require('../models/MalpracticeLog');
const {
  captureMonitoringEvidence,
  FACE_MISSING_EVIDENCE_CONFIDENCE_THRESHOLD,
  selectEvidenceTrigger,
} = require('../services/monitoringService');

const originalCreate = MonitoringEvidence.create;
const originalAggregate = MonitoringEvidence.aggregate;
const originalFindOne = MalpracticeLog.findOne;

const restoreStubs = () => {
  MonitoringEvidence.create = originalCreate;
  MonitoringEvidence.aggregate = originalAggregate;
  MalpracticeLog.findOne = originalFindOne;
};

const makeSession = (overrides = {}) => ({
  _id: 'session-1',
  institutionId: 'institution-1',
  userId: 'user-1',
  sessionType: 'assessment',
  visionFindings: {
    latestDetections: {},
  },
  evidenceCaptureState: new Map(),
  markModified() {},
  ...overrides,
});

test.afterEach(() => {
  restoreStubs();
});

test('single gaze and head-pose alerts do not qualify for evidence capture', () => {
  const session = makeSession();

  assert.equal(
    selectEvidenceTrigger(session, [
      { code: 'GAZE_AWAY', severity: 'MEDIUM', confidence: 0.91 },
    ], 0.91),
    null
  );

  assert.equal(
    selectEvidenceTrigger(session, [
      { code: 'HEAD_POSE_AWAY', severity: 'MEDIUM', confidence: 0.91 },
    ], 0.91),
    null
  );
});

test('face-missing evidence requires consecutive frames or threshold confidence', () => {
  const isolatedSession = makeSession({
    visionFindings: { latestDetections: { faceMissing: false } },
  });
  assert.equal(
    selectEvidenceTrigger(
      isolatedSession,
      [{ code: 'FACE_MISSING', severity: 'MEDIUM', confidence: 0.35 }],
      0.35
    ),
    null
  );

  const consecutiveSession = makeSession({
    visionFindings: { latestDetections: { faceMissing: true } },
  });
  const consecutiveTrigger = selectEvidenceTrigger(
    consecutiveSession,
    [{ code: 'FACE_MISSING', severity: 'MEDIUM', confidence: 0.2 }],
    0.2
  );
  assert.equal(consecutiveTrigger?.triggerCode, 'FACE_MISSING');

  const confidentSession = makeSession({
    visionFindings: { latestDetections: { faceMissing: false } },
  });
  const confidentTrigger = selectEvidenceTrigger(
    confidentSession,
    [{
      code: 'FACE_MISSING',
      severity: 'MEDIUM',
      confidence: FACE_MISSING_EVIDENCE_CONFIDENCE_THRESHOLD + 0.05,
    }],
    FACE_MISSING_EVIDENCE_CONFIDENCE_THRESHOLD + 0.05
  );
  assert.equal(confidentTrigger?.triggerCode, 'FACE_MISSING');
});

test('phone-visible evidence respects the per-trigger cooldown', async () => {
  const createdDocs = [];
  MonitoringEvidence.create = async (payload) => {
    createdDocs.push(payload);
    return payload;
  };
  MonitoringEvidence.aggregate = async (pipeline) => {
    const monitoringSessionId = pipeline[0]?.$match?.monitoringSessionId;
    const matching = createdDocs
      .filter((item) => item.monitoringSessionId === monitoringSessionId)
      .sort((left, right) => new Date(right.capturedAt) - new Date(left.capturedAt));

    if (!matching.length) {
      return [];
    }

    return [{
      evidenceCount: matching.length,
      latestEvidenceAt: matching[0].capturedAt,
      latestEvidenceTrigger: matching[0].triggerCode,
    }];
  };
  MalpracticeLog.findOne = () => ({
    select: async () => null,
  });

  const session = makeSession();
  const payload = {
    session,
    alerts: [{ code: 'PHONE_VISIBLE', severity: 'HIGH', confidence: 0.96 }],
    imageData: 'data:image/jpeg;base64,ZmFrZS1qcGVn',
    metadata: { width: 320, height: 240 },
    riskLevel: 'HIGH',
    confidence: 0.96,
    modelSource: 'onnx',
  };

  const first = await captureMonitoringEvidence(payload);
  const second = await captureMonitoringEvidence(payload);

  assert.equal(first.evidenceCaptured, true);
  assert.equal(first.evidenceTrigger, 'PHONE_VISIBLE');
  assert.equal(first.evidenceCount, 1);
  assert.equal(second.evidenceCaptured, false);
  assert.equal(second.evidenceCount, 1);
  assert.equal(createdDocs.length, 1);
});

test('institution-unlinked sessions never persist evidence', async () => {
  const session = makeSession({ institutionId: null });
  MonitoringEvidence.create = async () => {
    throw new Error('should not be called');
  };
  MonitoringEvidence.aggregate = async () => [];
  MalpracticeLog.findOne = () => ({
    select: async () => null,
  });

  const result = await captureMonitoringEvidence({
    session,
    alerts: [{ code: 'MULTIPLE_FACES', severity: 'HIGH', confidence: 0.9 }],
    imageData: 'data:image/jpeg;base64,ZmFrZS1qcGVn',
    metadata: { width: 320, height: 240 },
    riskLevel: 'HIGH',
    confidence: 0.9,
    modelSource: 'heuristic',
  });

  assert.deepEqual(result, {
    evidenceCaptured: false,
    evidenceTrigger: null,
    evidenceCount: 0,
  });
});
