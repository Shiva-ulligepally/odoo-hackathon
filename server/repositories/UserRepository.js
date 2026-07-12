const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmailWithPassword(email) {
    return await this.model.findOne({ email }).select('+password');
  }
}

module.exports = new UserRepository();
