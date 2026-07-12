const BaseRepository = require('./BaseRepository');
const Challenge = require('../models/Challenge');

class ChallengeRepository extends BaseRepository {
  constructor() {
    super(Challenge);
  }
}

module.exports = new ChallengeRepository();
