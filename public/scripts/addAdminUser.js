module.exports = function () {
  var express = require('express');
  var router = express.Router();

  var isAdmin = require('../../adminCheck.js');
  var bcrypt = require('bcrypt');
  const saltRounds = 10;


  function postAdmin(req, res, mysql, complete) {
    mysql.pool.query("SELECT id FROM roles WHERE role = 'admin';", function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }

      complete();

      bcrypt.hash(req.body.Password, saltRounds, function (err, hash) {
        let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        let sql = "INSERT INTO users (email, password, role_id, date_created) VALUES (?,?,?,?);";
        let inserts = [req.body.Email, hash, results[0].id, date];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
          if (error) {
            let context = {};
            context.adminPage = true;
            req.session.errorMessage += "\nInvalid User Entry.";
            context.errorText = req.session.errorMessage;
            res.render('addAdminUser', context);
            req.session.errorMessage = "";
          }

          else {
            complete();
          }
        });
      });
    });
  }


  // Display the admin homepage

  router.get('/', isAdmin, function (req, res) {
    let context = {};
    context.adminPage = true;
    res.render('addAdminUser', context);
    
  });


  // When user submits a new admin's information, add it to database and send them back to the admin table

  router.post('/', isAdmin, function (req, res) {
    let mysql = req.app.get('mysql');
    let callbackCount = 0;
    postAdmin(req, res, mysql, complete);
    function complete() {
      callbackCount++;
      if (callbackCount >= 2) {
        res.redirect('/viewAdmins');
      }
    }
  });

  return router;
}();