const Institution = require('../models/Institution');
const User = require('../models/User');

const DEFAULT_DEPARTMENT_CODE = 'GEN';
const DEFAULT_DEPARTMENT_NAME = 'General';

const inferStudentSource = (user = {}) => {
  if (user.studentSource) return user.studentSource;
  return user.mustResetPassword || user.isFirstLogin
    ? 'institution_created'
    : 'self_registered';
};

const ensureGeneralDepartment = (institution) => {
  let department = institution.departments.find(
    (entry) => entry.code === DEFAULT_DEPARTMENT_CODE
  );

  if (department) {
    return { department, created: false };
  }

  institution.departments.push({
    name: DEFAULT_DEPARTMENT_NAME,
    code: DEFAULT_DEPARTMENT_CODE,
    students: [],
    notes: '',
    targetPlacementDate: null,
  });

  department = institution.departments[institution.departments.length - 1];
  return { department, created: true };
};

const arraysEqual = (left = [], right = []) => {
  if (left.length !== right.length) return false;
  return left.every((value, index) => String(value) === String(right[index]));
};

const syncInstitutionRoster = async (institutionId) => {
  const institution = await Institution.findById(institutionId);
  if (!institution) return null;

  let institutionChanged = false;
  const { created } = ensureGeneralDepartment(institution);
  if (created) institutionChanged = true;

  const validDepartmentCodes = new Set(
    institution.departments.map((department) => department.code)
  );

  const linkedStudents = await User.find({ institutionId: institution._id }).select(
    '_id departmentCode studentSource mustResetPassword isFirstLogin'
  );

  const departmentMembership = new Map();
  const updates = [];

  linkedStudents.forEach((student) => {
    const nextDepartmentCode =
      student.departmentCode && validDepartmentCodes.has(student.departmentCode)
        ? student.departmentCode
        : DEFAULT_DEPARTMENT_CODE;
    const nextStudentSource = inferStudentSource(student);
    const nextValues = {};

    if (student.departmentCode !== nextDepartmentCode) {
      nextValues.departmentCode = nextDepartmentCode;
    }

    if (student.studentSource !== nextStudentSource) {
      nextValues.studentSource = nextStudentSource;
    }

    if (Object.keys(nextValues).length > 0) {
      updates.push({
        updateOne: {
          filter: { _id: student._id },
          update: { $set: nextValues },
        },
      });
    }

    if (!departmentMembership.has(nextDepartmentCode)) {
      departmentMembership.set(nextDepartmentCode, []);
    }

    departmentMembership.get(nextDepartmentCode).push(student._id);
  });

  if (updates.length > 0) {
    await User.bulkWrite(updates);
  }

  institution.departments.forEach((department) => {
    const nextStudents = Array.from(
      new Map(
        (departmentMembership.get(department.code) || []).map((studentId) => [
          String(studentId),
          studentId,
        ])
      ).values()
    );
    const currentStudents = (department.students || []).map(String);
    const nextStudentIds = nextStudents.map(String);

    if (!arraysEqual(currentStudents, nextStudentIds)) {
      department.students = nextStudents;
      institutionChanged = true;
    }
  });

  if (institutionChanged) {
    await institution.save();
  }

  return Institution.findById(institutionId);
};

module.exports = {
  DEFAULT_DEPARTMENT_CODE,
  DEFAULT_DEPARTMENT_NAME,
  ensureGeneralDepartment,
  inferStudentSource,
  syncInstitutionRoster,
};
