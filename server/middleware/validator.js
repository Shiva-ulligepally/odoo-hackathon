const CustomError = require('../utils/customError');

const validate = (validatorFunc) => {
  return (req, res, next) => {
    const { error, value } = validatorFunc(req.body);
    if (error) {
      return next(new CustomError(error, 400));
    }
    // Override request body with sanitized/parsed values
    req.body = value;
    next();
  };
};

module.exports = validate;
