const BaseRepository = require('./BaseRepository');
const Policy = require('../models/Policy');

class PolicyRepository extends BaseRepository {
  constructor() {
    super(Policy);
  }
}

module.exports = new PolicyRepository();
