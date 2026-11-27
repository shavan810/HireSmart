const router = require('express').Router();
const c = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { resumeUpload, imageUpload } = require('../middleware/upload');
const validate = require('../middleware/validate');
const { profileRules } = require('../middleware/validators');

router.use(protect);

router.put('/profile', profileRules, validate, c.updateProfile);
router.post('/avatar', imageUpload, c.uploadAvatar);
router.put('/preferences', c.updatePreferences);
router.delete('/me', c.deleteAccount);

router.post('/resume', authorize('jobseeker'), resumeUpload, c.uploadResume);
router.delete('/resume', authorize('jobseeker'), c.deleteResume);

module.exports = router;
