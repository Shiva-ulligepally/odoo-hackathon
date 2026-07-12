const mongoose = require('mongoose');

const AIRecommendationSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  recommendationType: {
    type: String,
    enum: ['Carbon Reduction', 'Energy Efficiency', 'Waste Optimization', 'Compliance Risk'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  potentialSavingsCo2e: {
    type: Number, // Estimated CO2 reduction (MT CO2e)
    default: 0
  },
  potentialFinancialSavings: {
    type: Number, // Estimated financial savings in currency
    default: 0
  },
  confidenceScore: {
    type: Number, // Percentage 0 - 100
    default: 80
  },
  status: {
    type: String,
    enum: ['New', 'Accepted', 'Implemented', 'Dismissed'],
    default: 'New'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AIRecommendation', AIRecommendationSchema);
