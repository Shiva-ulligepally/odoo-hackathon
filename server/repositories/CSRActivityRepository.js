const BaseRepository = require('./BaseRepository');
const CSRActivity = require('../models/CSRActivity');

class CSRActivityRepository extends BaseRepository {
  constructor() {
    super(CSRActivity);
  }
}

module.exports = new CSRActivityRepository();
