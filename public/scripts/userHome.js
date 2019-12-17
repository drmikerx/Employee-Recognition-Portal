module.exports = function(){
    var express = require('express');
	var isGeneral = require('../../generalUserCheck.js');
    var router = express.Router();

  
  // Display the user homepage
  
  router.get('/', isGeneral, function(req, res){
        let context = {};
        context.userPage = true;
        res.render('userHome', context);
    });
    
    
    return router;
}();