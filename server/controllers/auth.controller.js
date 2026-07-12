const AuthService = require('../services/auth.service');
const { sendResponse } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const result = await AuthService.registerAdmin(req.body);
    return sendResponse(res, 201, true, 'Registered successfully', result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    return sendResponse(res, 200, true, 'Logged in successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login
};
