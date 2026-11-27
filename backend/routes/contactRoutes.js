const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { sendMessage } = require('../controllers/contactController');
const validate = require('../middleware/validate');
const { contactRules } = require('../middleware/validators');

const limiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, message: { success: false, message: 'Too many messages. Try again later.' } });

router.post('/', limiter, contactRules, validate, sendMessage);

module.exports = router;
