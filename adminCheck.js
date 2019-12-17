module.exports = function isAdmin(req, res, next) {
  if (req.session && req.session.role == 'admin' || req.session.role == 'superAdmin') {
    // user is authenticated
    next();
  } else {
    // return unauthorized
    res.redirect('unauthorized');
  }
};
