const BaseRepository = require('./BaseRepository');
const Badge = require('../models/Badge');

class BadgeRepository extends BaseRepository {
  constructor() {
    super(Badge);
  }
}

module.exports = new BadgeRepository();
