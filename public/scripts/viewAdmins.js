module.exports = function(){
    var express = require('express');
    var router = express.Router();

    var isAdmin = require('../../adminCheck.js');


    function getAdmins(res, mysql, context, complete) {
        mysql.pool.query("SELECT id, role_id, email AS `Username`, date_created AS `TimeCreated` FROM users WHERE role_id = 1;", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }

            context.admins = results;
            complete();
        });

    }

  // Display the view admins page
  
  router.get('/', isAdmin, function(req, res){
        // When page loads, display the admin users
        var callbackCount = 0;  // Makes sure all of our functions finish before rendering the page with the context
        let context = {};
        context.jsscripts = ["deleteAdmin.js"];
        
        var mysql = req.app.get('mysql');
        getAdmins(res, mysql, context, complete);
        context.adminPage = true;
        function complete(){    // Each "setup" function calls this function to signal that it is finished
            callbackCount++;
            if(callbackCount >= 1){
                res.render('viewAdmins', context);  // Only render when context is all setup
            }
        }
    });
    

    // All traffic to this handler will come from our AJAX setup in deleteAdmin.js

    router.delete('/:id', isAdmin, function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM users WHERE id = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400).end();
            }

            else{
                res.status(202).end();      // AJAX function will handle refreshing the table for us
            }
        });
    });
    
    return router;
}();