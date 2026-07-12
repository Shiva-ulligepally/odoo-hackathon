const BaseRepository = require('./BaseRepository');
const AIRecommendation = require('../models/AIRecommendation');

class AIRecommendationRepository extends BaseRepository {
  constructor() {
    super(AIRecommendation);
  }
}

module.exports = new AIRecommendationRepository();
