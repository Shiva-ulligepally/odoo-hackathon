const mongoose = require('mongoose');

const CarbonRecordSchema = new mongoose.Schema({
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  scope: {
    type: String,
    enum: ['Scope 1', 'Scope 2', 'Scope 3'], // Scope classification
    required: true
  },
  activityType: {
    type: String,
    enum: ['Electricity', 'Fuel Combustion', 'Business Travel', 'Waste Disposal', 'Water Consumption', 'Employee Commute'],
    required: true
  },
  value: {
    type: Number, // Measured in metric tons of CO2e
    required: [true, 'Please add emission value in metric tons of CO2e']
  },
  unit: {
    type: String,
    default: 'MT CO2e'
  },
  date: {
    type: Date,
    required: [true, 'Please specify logging date'],
    default: Date.now
  },
  evidenceDocument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UploadedDocument'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CarbonRecord', CarbonRecordSchema);
