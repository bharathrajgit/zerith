const jwt = require('jsonwebtoken');
const Institution = require('../models/Institution');

const protectInstitution = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'institution') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type',
      });
    }

    const institution = await Institution.findById(decoded.id);
    if (!institution) {
      return res.status(401).json({
        success: false,
        message: 'Institution not found',
      });
    }

    if (!institution.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Institution account deactivated',
      });
    }

    req.institution = institution;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token verification failed',
    });
  }
};

module.exports = { protectInstitution };