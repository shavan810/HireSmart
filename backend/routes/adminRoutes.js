const router = require('express').Router();
const c = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/users', c.getUsers);
router.patch('/users/:id/status', c.setUserStatus);
router.delete('/users/:id', c.deleteUser);

router.get('/jobs', c.getJobs);
router.patch('/jobs/:id/status', c.setJobStatus);
router.delete('/jobs/:id', c.deleteJob);

router.get('/applications', c.getApplications);

module.exports = router;
