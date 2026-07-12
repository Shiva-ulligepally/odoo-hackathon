const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add report title'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Carbon Footprint', 'Sustainability', 'Energy Audit'],
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  dateRange: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UploadedDocument'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', ReportSchema);
