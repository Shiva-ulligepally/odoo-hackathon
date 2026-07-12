const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an organization name'],
    unique: true,
    trim: true
  },
  industry: {
    type: String,
    required: [true, 'Please specify organization industry']
  },
  location: {
    type: String,
    required: [true, 'Please specify organization location']
  },
  esgTarget: {
    type: String,
    default: 'Net Zero by 2030'
  },
  carbonGoal: {
    type: Number, // Annual target in metric tons of CO2e
    default: 1000
  },
  financialYear: {
    type: String,
    default: 'FY2026'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Organization', OrganizationSchema);
