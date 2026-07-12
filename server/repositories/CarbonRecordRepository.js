const BaseRepository = require('./BaseRepository');
const CarbonRecord = require('../models/CarbonRecord');

class CarbonRecordRepository extends BaseRepository {
  constructor() {
    super(CarbonRecord);
  }
}

module.exports = new CarbonRecordRepository();
