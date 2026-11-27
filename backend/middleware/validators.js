const { body } = require('express-validator');
const { JOB_TYPES, EXPERIENCE_LEVELS, CATEGORIES, CURRENCIES, APPLICATION_STATUS, ROLES } = require('../utils/constants');

const email = () => body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail({ gmail_remove_dots: false });

const registerRules = [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),
  email(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
    .matches(/\d/).withMessage('Password must contain a number'),
  body('role').isIn([ROLES.SEEKER, ROLES.RECRUITER]).withMessage('Role must be jobseeker or recruiter'),
  body('companyName').if(body('role').equals(ROLES.RECRUITER)).trim().notEmpty().withMessage('Company name is required for recruiters'),
];

const loginRules = [email(), body('password').notEmpty().withMessage('Password is required')];

const passwordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Za-z]/).withMessage('New password must contain a letter')
    .matches(/\d/).withMessage('New password must contain a number'),
];

const jobRules = [
  body('title').trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3-120 characters'),
  body('description').trim().isLength({ min: 30, max: 6000 }).withMessage('Description must be at least 30 characters'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('jobType').isIn(JOB_TYPES).withMessage('Invalid job type'),
  body('experienceLevel').isIn(EXPERIENCE_LEVELS).withMessage('Invalid experience level'),
  body('category').isIn(CATEGORIES).withMessage('Invalid category'),
  body('currency').optional().isIn(CURRENCIES).withMessage('Invalid currency'),
  body('salaryMin').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Minimum salary must be a positive number'),
  body('salaryMax').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Maximum salary must be a positive number'),
  body('deadline').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid deadline date'),
];

const applyRules = [body('coverLetter').optional().trim().isLength({ max: 2000 }).withMessage('Cover letter is limited to 2000 characters')];

const statusRules = [
  body('status').isIn(APPLICATION_STATUS).withMessage(`Status must be one of: ${APPLICATION_STATUS.join(', ')}`),
  body('note').optional().trim().isLength({ max: 500 }).withMessage('Note is limited to 500 characters'),
];

const contactRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name is required'),
  email(),
  body('subject').trim().isLength({ min: 3, max: 150 }).withMessage('Subject is required'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be at least 10 characters'),
];

const profileRules = [
  body('name').optional().trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),
  body('phone').optional({ checkFalsy: true }).trim().matches(/^[0-9+\-\s()]{7,20}$/).withMessage('Enter a valid phone number'),
  body('experience').optional({ checkFalsy: true }).isFloat({ min: 0, max: 60 }).withMessage('Experience must be between 0 and 60 years'),
  body('companyWebsite').optional({ checkFalsy: true }).trim().isURL().withMessage('Enter a valid website URL'),
];

module.exports = { registerRules, loginRules, passwordRules, jobRules, applyRules, statusRules, contactRules, profileRules };
