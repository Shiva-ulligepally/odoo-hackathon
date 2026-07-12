const BaseRepository = require('./BaseRepository');
const Report = require('../models/Report');

class ReportRepository extends BaseRepository {
  constructor() {
    super(Report);
  }
}

module.exports = new ReportRepository();
