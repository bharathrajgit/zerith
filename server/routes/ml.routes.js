// server/routes/ml.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const mlService = require('../services/mlService');
const User = require('../models/User');

// ── Health check (public) ──────────────────────────────
router.get('/health', async (req, res) => {
  try {
    const status = await mlService.checkMLHealth();
    res.json({ success: true, data: status });
  } catch (err) {
    res.json({ success: true, data: { online: false } });
  }
});

// ── Classify student level ─────────────────────────────
router.post('/classify-level', protect, async (req, res) => {
  try {
    const { performance_data } = req.body;

    if (!performance_data) {
      return res.status(400).json({
        success: false,
        message: 'performance_data is required',
      });
    }

    // Forward to Flask ML service
    const result = await mlService.classifyLevel(performance_data);
    if (!result || !result.level) {
      throw new Error('ML service returned invalid data');
    }

    // Save level to user profile (ignore errors, don't block response)
    try {
      await User.findByIdAndUpdate(req.user._id, {
        currentLevel: result.level,
      });
    } catch (userErr) {
      console.error('Failed to update user level:', userErr.message);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Classify level route error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      detail: error.message,
    });
  }
});

// ── Detect weak areas ──────────────────────────────────
router.post('/detect-weak-areas', protect, async (req, res) => {
  try {
    const { topics } = req.body;

    if (!topics || !Array.isArray(topics)) {
      return res.status(400).json({
        success: false,
        message: 'topics array is required',
      });
    }

    const result = await mlService.detectWeakAreas(topics);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Detect weak areas route error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      detail: error.message,
    });
  }
});

// ── Readiness score ────────────────────────────────────
router.post('/readiness-score', protect, async (req, res) => {
  try {
    const { mastery } = req.body;

    if (!mastery || typeof mastery !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'mastery object is required',
      });
    }

    const result = await mlService.getReadinessScore(mastery);

    // Update user placement readiness (non‑blocking)
    try {
      await User.findByIdAndUpdate(req.user._id, {
        placementReadiness: result.readiness_score || 0,
      });
    } catch (userErr) {
      console.error('Failed to update readiness:', userErr.message);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Readiness score route error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      detail: error.message,
    });
  }
});

// ── Feature importance ─────────────────────────────────
router.get('/feature-importance', protect, async (req, res) => {
  try {
    const result = await mlService.getFeatureImportance();
    if (!result) {
      return res.status(503).json({
        success: false,
        message: 'ML service unavailable',
      });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Feature importance route error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      detail: error.message,
    });
  }
});

// ── Training report ─────────────────────────────────────
router.get('/training-report', protect, async (req, res) => {
  try {
    const result = await mlService.getTrainingReport();
    if (!result) {
      return res.status(503).json({
        success: false,
        message:
          'Training report not found. Run python train_models.py first.',
      });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Training report route error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      detail: error.message,
    });
  }
});

module.exports = router;