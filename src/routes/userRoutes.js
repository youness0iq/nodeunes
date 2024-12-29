const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

const registerValidation = [
  check('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

router.post('/register', registerValidation, userController.register);
router.post('/login', userController.login);
router.get('/verify-token', auth, userController.verifyToken);

module.exports = router;