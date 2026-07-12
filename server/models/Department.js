const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a department name'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Please add a department code'],
    uppercase: true,
    trim: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure department name is unique per organization
DepartmentSchema.index({ name: 1, organization: 1 }, { unique: true });

module.exports = mongoose.model('Department', DepartmentSchema);
