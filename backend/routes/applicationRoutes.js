const router = require('express').Router();
const c = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { applyRules, statusRules } = require('../middleware/validators');

router.use(protect);

router.get('/mine', authorize('jobseeker'), c.getMyApplications);
router.get('/recruiter', authorize('recruiter'), c.getRecruiterApplications);
router.post('/:jobId', authorize('jobseeker'), applyRules, validate, c.apply);
router.patch('/:id/status', authorize('recruiter'), statusRules, validate, c.updateStatus);
router.delete('/:id', authorize('jobseeker'), c.withdraw);
router.get('/:id', c.getApplication);

module.exports = router;
