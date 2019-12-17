module.exports = function(){
    var express = require('express');
    var router = express.Router();

    var isAdmin = require('../../adminCheck.js');

    // Get the account information to display in the edit form upon page load

    function getAccountInfo(req, res, mysql, context, complete) {
        var sql = "SELECT user_name, email, signature_path FROM users WHERE id = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400).end();
            }

            context.user_name = results[0].user_name;
            context.email = results[0].email;
            context.signature_path = results[0].signature_path;
            complete();
        });

    }


    function editGeneralUser(req, res, mysql, complete) {
        var sql = "UPDATE users SET email = ?, user_name = ? WHERE id = ?";
        var inserts = [req.body.Email, req.body.user_name, req.body.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
            if(error) {
             
              req.session.errorMessage += "\nInvalid User Entry.";
              
              res.redirect('editGeneralUserAdminSite/' + req.body.id);
              
            }

            else {
                complete();
            }
        });
    }


    router.get('/:id', isAdmin, function(req, res) {

        var callbackCount = 0;
        let context = {};
        context.adminPage = true;
        context.id = req.params.id;     // Stored in a hidden input field, used later in edit process
        context.errorText = req.session.errorMessage;
        var mysql = req.app.get('mysql');
        getAccountInfo(req, res, mysql, context, complete);
        function complete(){    // Each "setup" function calls this function to signal that it is finished
            callbackCount++;
            if(callbackCount >= 1){
                res.render('editGeneralUserAdminSite', context);  // Only render when context is all setup
                req.session.errorMessage = "";
            }
        }
    });


    // Using POST as method because PUT is not supported by HTML forms

    router.post('/', isAdmin, function(req, res) {
        let mysql = req.app.get('mysql');
        var callbackCount = 0;
        editGeneralUser(req, res, mysql, complete);
        function complete() {
            callbackCount++;
            if(callbackCount >= 1) {
                res.redirect('/viewGeneralUsers');
            }
        }
    });


    return router;
}();