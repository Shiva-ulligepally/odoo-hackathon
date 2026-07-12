const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a policy title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add policy description']
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Archived'],
    default: 'Draft'
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

module.exports = mongoose.model('Policy', PolicySchema);
