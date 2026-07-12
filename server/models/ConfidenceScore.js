const mongoose = require('mongoose');

const ConfidenceScoreSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  targetModel: {
    type: String, // e.g. 'CarbonRecord', 'EnergyBill'
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  score: {
    type: Number, // 0 - 100 percentage
    required: true
  },
  factors: [{
    factorName: String,
    status: { type: String, enum: ['Pass', 'Warning', 'Fail'] },
    weight: Number
  }],
  verifiedByAI: {
    type: Boolean,
    default: false
  },
  lastCalculated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ConfidenceScore', ConfidenceScoreSchema);
