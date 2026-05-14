// server/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Institution = require('../models/Institution');
const { serializeUserReadiness } = require('../services/userReadinessService');
const {
  DEFAULT_DEPARTMENT_CODE,
  ensureGeneralDepartment,
} = require('../services/institutionRosterService');

// Private helper – generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId, type: 'student' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      name = '',
      college = '',
      targetGoal = 'Interview Prep',
      institutionCode,
    } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email and password',
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken',
      });
    }

    // Validate institution code if provided
    let institutionId = null;
    let institutionDocument = null;
    let departmentCode = '';
    if (institutionCode && institutionCode.trim()) {
      institutionDocument = await Institution.findOne({
        institutionCode: institutionCode.trim().toUpperCase(),
      });
      if (!institutionDocument) {
        return res.status(400).json({
          success: false,
          message: 'Invalid institution code',
        });
      }
      institutionId = institutionDocument._id;
      const { created } = ensureGeneralDepartment(institutionDocument);
      if (created) {
        await institutionDocument.save();
      }
      departmentCode = DEFAULT_DEPARTMENT_CODE;
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      name,
      college,
      targetGoal,
      role: 'student',
      institutionId,
      departmentCode,
      studentSource: 'self_registered',
      isFirstLogin: false,
      mustResetPassword: false,
      diagnosticCompleted: false,
    });

    if (institutionDocument) {
      const generalDepartment = institutionDocument.departments.find(
        (department) => department.code === DEFAULT_DEPARTMENT_CODE
      );
      if (generalDepartment && !generalDepartment.students.some((id) => String(id) === String(user._id))) {
        generalDepartment.students.push(user._id);
        await institutionDocument.save();
      }
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from output
    const userObj = serializeUserReadiness(user.toObject());
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user: userObj },
      token,
    });
  } catch (err) {
    console.error('❌ Student registration failed:', err.message || err);
    if (err.stack) console.error(err.stack);
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password field (since it's select: false)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last active
    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from output
    const userObj = serializeUserReadiness(user.toObject());
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: userObj, mustResetPassword: user.mustResetPassword, },
      token,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Student resets temporary password on first login
// @route   PUT /api/auth/reset-first-password
// @access  Private
const resetFirstPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide currentPassword, newPassword, and confirmNewPassword',
      });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user.mustResetPassword) {
      return res.status(400).json({
        success: false,
        message: 'No password reset required',
      });
    }

    // Verify current (temporary) password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;          // pre‑save will hash it
    user.mustResetPassword = false;
    user.isFirstLogin = false;
    await user.save();

    const token = generateToken(user._id);
    const safeUser = serializeUserReadiness(user.toObject());
    delete safeUser.password;

    res.status(200).json({
      success: true,
      token,
      data: {
        user: safeUser,
      },
      message: 'Password reset successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    // req.user is set by protect middleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { user: serializeUserReadiness(user.toObject()) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, college, targetGoal } = req.body;
    
    const updates = {};
    if (name !== undefined && name.trim()) updates.name = name.trim();
    if (college !== undefined && college.trim()) updates.college = college.trim();
    if (targetGoal !== undefined && targetGoal.trim()) updates.targetGoal = targetGoal.trim();

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: serializeUserReadiness(user.toObject()) },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateProfile, resetFirstPassword };
