// server/routes/department.routes.js
const express = require('express');
const router = express.Router();
const { protectInstitution } = require('../middleware/institution.middleware');
const {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartments,
  moveStudentDepartment,
} = require('../controllers/department.controller');

router.use(protectInstitution);

router.route('/')
  .post(createDepartment)
  .get(getDepartments);

router.put('/move-student', moveStudentDepartment);

router.route('/:code')
  .put(updateDepartment)
  .delete(deleteDepartment);

module.exports = router;
