const multer = require('multer');
const CustomError = require('../utils/customError');

// Memory storage is ideal when we stream directly to Cloudinary or process buffers
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow PDFs, images, Excel/CSV sheets and Word documents
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new CustomError('Invalid file type. Only PDF, JPG, PNG, CSV, XLSX, and DOCX are allowed.', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  }
});

module.exports = upload;
