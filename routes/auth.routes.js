const router = require('express').Router();
const authController = require('../controllers/auth.controller');

router.post('/signup', authController.signupController);

router.post('/logout', authController.logoutController);

router.post('/login', authController.loginController);

router.get('/reset', authController.getForgetPasswordController);

router.post('reset/:token', authController.postResetPasswordController );

module.exports = router;