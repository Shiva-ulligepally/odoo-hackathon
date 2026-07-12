const sendResponse = (res, statusCode, success, message, data = {}, meta = null) => {
  const response = {
    success,
    message,
    data,
    meta,
    timestamp: new Date().toISOString()
  };

  return res.status(statusCode).json(response);
};

module.exports = { sendResponse };
