module.exports = function isGeneralUser(req, res, next) {
  if (req.session && req.session.role == 'general') {
    // user is authenticated
    next();
  } else {
    // return unauthorized
    res.redirect('unauthorized');
  }
};