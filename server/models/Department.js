const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    // Other fields can be added later (head, student count, etc.)
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);