const mongoose = require('mongoose');

const EnergyBillSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  utilityType: {
    type: String,
    enum: ['Electricity', 'Natural Gas', 'Water', 'Diesel'],
    required: true
  },
  amount: {
    type: Number, // Cost in currency
    required: true
  },
  consumption: {
    type: Number, // Measured in kWh, gallons, etc.
    required: true
  },
  unit: {
    type: String, // kWh, Gallons, Litres
    required: true
  },
  billingPeriodStart: {
    type: Date,
    required: true
  },
  billingPeriodEnd: {
    type: Date,
    required: true
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

module.exports = mongoose.model('EnergyBill', EnergyBillSchema);
