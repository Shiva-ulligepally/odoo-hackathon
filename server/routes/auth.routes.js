const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const validate = require('../middleware/validator');
const { validateRegister, validateLogin } = require('../validators/auth.validator');

router.post('/register', validate(validateRegister), AuthController.register);
router.post('/login', validate(validateLogin), AuthController.login);

module.exports = router;
