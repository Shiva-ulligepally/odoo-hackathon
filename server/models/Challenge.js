const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a challenge title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add challenge description']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  rewardPoints: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Active', 'Completed'],
    default: 'Upcoming'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
