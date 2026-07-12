const BaseRepository = require('./BaseRepository');
const ConfidenceScore = require('../models/ConfidenceScore');

class ConfidenceScoreRepository extends BaseRepository {
  constructor() {
    super(ConfidenceScore);
  }
}

module.exports = new ConfidenceScoreRepository();
