const UploadService = require('../services/upload.service');
const { sendResponse } = require('../utils/response');
const CustomError = require('../utils/customError');

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new CustomError('Please select a file to upload', 400));
    }
    const document = await UploadService.uploadFile(req.file, req.user);
    return sendResponse(res, 201, true, 'File uploaded and logged successfully', document);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument
};
