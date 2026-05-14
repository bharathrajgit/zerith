const normalizeReadinessLevel = (rawLevel) => {
  const normalized = String(rawLevel || '').trim().toLowerCase();

  if (normalized === 'intermediate') return 'Intermediate';
  if (
    normalized === 'placement-ready' ||
    normalized === 'placement ready' ||
    normalized === 'advanced' ||
    normalized === 'advance'
  ) {
    return 'Placement-Ready';
  }

  return 'Beginner';
};

const clampReadiness = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, Math.round(parsed)));
};

const inferPlacementReadiness = (user = {}) => {
  const explicitReadiness = clampReadiness(user?.placementReadiness);
  if (explicitReadiness > 0) {
    return explicitReadiness;
  }

  const diagnosticScore = clampReadiness(user?.diagnosticScore);
  if (diagnosticScore > 0) {
    return diagnosticScore;
  }

  switch (normalizeReadinessLevel(user?.currentLevel)) {
    case 'Placement-Ready':
      return 85;
    case 'Intermediate':
      return 65;
    default:
      return user?.diagnosticCompleted ? 35 : 0;
  }
};

const serializeUserReadiness = (user = {}) => ({
  ...user,
  currentLevel: normalizeReadinessLevel(user?.currentLevel),
  placementReadiness: inferPlacementReadiness(user),
});

module.exports = {
  clampReadiness,
  inferPlacementReadiness,
  normalizeReadinessLevel,
  serializeUserReadiness,
};
