const { validationResult } = require('express-validator');

// Runs after express-validator chains and returns a 422 with field-level messages.
module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
  return res.status(422).json({ success: false, message: errors[0].message, errors });
};
