const router = require('express').Router();
const c = require('../controllers/jobController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { jobRules } = require('../middleware/validators');

// Public
router.get('/', c.getJobs);
router.get('/stats', c.getPublicStats);

// Recruiter (declared before '/:id' so "mine" is not treated as an id)
router.get('/mine/list', protect, authorize('recruiter'), c.getMyJobs);
router.post('/', protect, authorize('recruiter'), jobRules, validate, c.createJob);

router.get('/:id', optionalAuth, c.getJob);
router.put('/:id', protect, authorize('recruiter'), jobRules, validate, c.updateJob);
router.delete('/:id', protect, authorize('recruiter'), c.deleteJob);

module.exports = router;
