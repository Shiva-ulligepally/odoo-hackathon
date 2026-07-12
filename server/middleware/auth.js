const jwt = require('jsonwebtoken');
const CustomError = require('../utils/customError');
const UserRepository = require('../repositories/UserRepository');
const EmployeeRepository = require('../repositories/EmployeeRepository');

// Protect Routes middleware
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new CustomError('Not authorized to access this route', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_for_enterprise_production_123!');

    // Get user from DB
    const user = await UserRepository.findById(decoded.id);

    if (!user) {
      return next(new CustomError('User belonging to this token no longer exists', 401));
    }

    if (user.status === 'Inactive') {
      return next(new CustomError('User account has been deactivated', 403));
    }

    req.user = user;

    // Retrieve corresponding employee profile if it exists
    const employee = await EmployeeRepository.findByUserId(user._id);
    if (employee) {
      req.employee = employee;
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new CustomError(
          `User role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
