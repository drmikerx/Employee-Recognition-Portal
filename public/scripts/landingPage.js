module.exports = function(){
  var express = require('express');
  var router = express.Router();


// Display the view admins page

router.get('/', function(req, res){
      // When page loads, display the admin users
      var callbackCount = 0;  // Makes sure all of our functions finish before rendering the page with the context
      let context = {};
      context.errorText = req.session.errorMessage;
      res.render('landingPage', context);  // Only render when context is all setup
      delete req.session.errorText;
  });
  

  
  return router;
}();