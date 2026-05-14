const express = require('express');
const router = express.Router();
const { protectInstitution } = require('../middleware/institution.middleware');
const {
  addSingleStudent,
  addBulkStudents,
  getAllStudents,
  removeStudent,
  resetStudentPassword,
} = require('../controllers/institution.student.controller');

// All routes are protected for institution admin
router.use(protectInstitution);

router.post('/add', addSingleStudent);
router.post('/bulk', addBulkStudents);
router.get('/', getAllStudents);
router.delete('/:studentId', removeStudent);
router.put('/:studentId/reset-password', resetStudentPassword);

module.exports = router;