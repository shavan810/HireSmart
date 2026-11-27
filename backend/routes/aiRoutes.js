const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

// AI calls are expensive: cap them per user/IP.
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Analysis limit reached. Please try again in an hour.' },
});

router.use(protect, authorize('jobseeker'));
router.post('/analyze', aiLimiter, c.analyze);
router.get('/history', c.history);

module.exports = router;
