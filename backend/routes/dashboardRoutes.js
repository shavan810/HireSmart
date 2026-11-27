const router = require('express').Router();
const c = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/seeker', authorize('jobseeker'), c.seekerDashboard);
router.get('/recruiter', authorize('recruiter'), c.recruiterDashboard);
router.get('/admin', authorize('admin'), c.adminDashboard);

module.exports = router;
