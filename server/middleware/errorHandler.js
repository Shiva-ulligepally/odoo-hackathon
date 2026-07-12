const { sendResponse } = require('../utils/response');
const logger = require('../utils/logger');

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  logger.error(`${req.method} ${req.url} - ${err.message}`, err);

  // Mongoose Bad ObjectId Error
  if (err.name === 'CastError') {
    err.message = `Resource not found with id of ${err.value}`;
    err.statusCode = 404;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    err.message = 'Duplicate field value entered';
    err.statusCode = 400;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    err.message = Object.values(err.errors).map(val => val.message).join(', ');
    err.statusCode = 400;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    err.message = 'Invalid token. Please log in again.';
    err.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    err.message = 'Your token has expired. Please log in again.';
    err.statusCode = 401;
  }

  return sendResponse(res, err.statusCode, false, err.message, null);
};

module.exports = globalErrorHandler;
