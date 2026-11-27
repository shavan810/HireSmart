// Strips MongoDB operators ($where, $gt ...) and dotted keys from user input
// to block NoSQL injection. (express-mongo-sanitize does the same; this keeps
// the dependency list short and works on Express 4.)
const clean = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  Object.keys(obj).forEach((key) => {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else {
      clean(obj[key]);
    }
  });
  return obj;
};

module.exports = (req, _res, next) => {
  clean(req.body);
  clean(req.query);
  clean(req.params);
  next();
};
