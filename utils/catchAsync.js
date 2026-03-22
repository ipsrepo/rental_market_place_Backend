module.exports = (fn) => (req, res, next) => {
  // console.log('catch Async called');
  fn(req, res, next).catch((err) => next(err));
};
