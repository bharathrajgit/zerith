const bcrypt = require('bcryptjs');

/**
 * Generate a temporary student password in the format DSA@XXXX
 * @returns { plainText: string }
 */
const generateStudentPassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DSA@${randomPart}`;
};

/**
 * Generate credentials for a bulk list of students.
 * @param {Array} studentList - [{ name, email, departmentCode }]
 * @returns {Array} - [{ name, email, departmentCode, plainPassword }]
 */
const generateBulkCredentials = (studentList) => {
  return studentList.map((student) => ({
    name: student.name,
    email: student.email,
    departmentCode: student.departmentCode,
    plainPassword: generateStudentPassword(),
  }));
};

module.exports = { generateStudentPassword, generateBulkCredentials };
