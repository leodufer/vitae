const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimitMiddleware');
const {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator
} = require('../middlewares/validators/authValidator');

router.post('/register', authLimiter, registerValidator, authController.register);
router.post('/login', authLimiter, loginValidator, authController.login);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, authController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidator, authController.resetPassword);

module.exports = router;
