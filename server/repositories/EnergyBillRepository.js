const BaseRepository = require('./BaseRepository');
const EnergyBill = require('../models/EnergyBill');

class EnergyBillRepository extends BaseRepository {
  constructor() {
    super(EnergyBill);
  }
}

module.exports = new EnergyBillRepository();
