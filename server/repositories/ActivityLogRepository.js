const BaseRepository = require('./BaseRepository');
const ActivityLog = require('../models/ActivityLog');

class ActivityLogRepository extends BaseRepository {
  constructor() {
    super(ActivityLog);
  }
}

module.exports = new ActivityLogRepository();
