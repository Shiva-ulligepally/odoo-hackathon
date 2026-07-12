const BaseRepository = require('./BaseRepository');
const Department = require('../models/Department');

class DepartmentRepository extends BaseRepository {
  constructor() {
    super(Department);
  }
}

module.exports = new DepartmentRepository();
