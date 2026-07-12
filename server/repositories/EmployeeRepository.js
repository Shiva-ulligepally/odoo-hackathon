const BaseRepository = require('./BaseRepository');
const Employee = require('../models/Employee');

class EmployeeRepository extends BaseRepository {
  constructor() {
    super(Employee);
  }

  async findByUserId(userId, options = {}) {
    return await this.findOne({ user: userId }, options);
  }
}

module.exports = new EmployeeRepository();
