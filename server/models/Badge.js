const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a badge name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add badge description']
  },
  criteria: {
    type: String,
    required: [true, 'Please state badge awarding criteria']
  },
  iconUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=200'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Badge', BadgeSchema);
