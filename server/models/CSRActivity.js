const mongoose = require('mongoose');

const CSRActivitySchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a CSR activity title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a CSR activity description']
  },
  date: {
    type: Date,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  status: {
    type: String,
    enum: ['Planned', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Planned'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CSRActivity', CSRActivitySchema);
