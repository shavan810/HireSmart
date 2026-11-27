const router = require('express').Router();
const { register, login, adminLogin, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerRules, loginRules, passwordRules } = require('../middleware/validators');

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/admin/login', loginRules, validate, adminLogin);
router.get('/me', protect, getMe);
router.put('/password', protect, passwordRules, validate, changePassword);

module.exports = router;
