const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add reward title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add reward description']
  },
  pointsRequired: {
    type: Number,
    required: [true, 'Please specify points required to redeem']
  },
  stock: {
    type: Number,
    default: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reward', RewardSchema);
