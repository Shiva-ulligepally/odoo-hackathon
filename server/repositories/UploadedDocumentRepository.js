const BaseRepository = require('./BaseRepository');
const UploadedDocument = require('../models/UploadedDocument');

class UploadedDocumentRepository extends BaseRepository {
  constructor() {
    super(UploadedDocument);
  }
}

module.exports = new UploadedDocumentRepository();
