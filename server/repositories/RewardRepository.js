const BaseRepository = require('./BaseRepository');
const Reward = require('../models/Reward');

class RewardRepository extends BaseRepository {
  constructor() {
    super(Reward);
  }
}

module.exports = new RewardRepository();
