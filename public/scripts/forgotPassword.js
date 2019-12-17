module.exports = function () {
  var express = require('express');
  var router = express.Router();
  var mailer = require('./mailer.js');
  var crypt = require('crypto');
  var mysql = require('../../dbcon.js');
  var bcrypt = require('bcrypt');
  const saltRounds = 10;

  router.get('/', function (req, res) {
    let context = {};
    context.userPage = true;
    res.render('forgotPassword', context);
  });

  router.get('/Reset/:token', function (req, res) {
    res.render('resetPassword');
  });

  router.post('/Reset/:token', function (req, res) {
    mysql.pool.query("Select * FROM users where reset_token = ?", [req.params.token], function (err, result, fields) {
      if (err) {
        res.render('resetFailed');
      };
      if (result.length == 1) {
        var tokenTime = result[0].reset_timeout;
        var currentDate = new Date();
        if (tokenTime < currentDate) {
          res.render('resetFailed');
        } else {
          updateUser(req);
          res.redirect('/');
        }

      }
      else {
        res.render('resetFailed');
      }
     
    });
    
  });


  function updateUser(req) {
    mysql.pool.query("Select * FROM users where reset_token = ?", [req.params.token], function (err, result, fields) {
      if (err) {
        return false;
      };
      if (result.length == 1) {
        var id = result[0].id;
        bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
          mysql.pool.query("update users set password = ?, reset_timeout = null, reset_token = null where id = ?", [hash, id], function (err, result) {
            if (err) {
              return false;
            };
          });
        });
      }
      else {
        return false;
      }
    });
    return true;
  }

  router.post('/', function (req, res) {

    var buffer = crypt.randomBytes(20);
    var token = buffer.toString('hex');
    var link =  req.headers.host + "/forgotPassword/reset/" + token;
    if (req.headers.host !== 'localhost:5000') {
      link = "https://" + link;
    }
    if (setUserReset(req.body.EmailRecovery, token)) {
      var mail = new mailer();
      var mailOptions = {
        from: 'cchincinfo@gmail.com', // sender address
        to: req.body.EmailRecovery, // list of receivers
        subject:  "CCH Awards Password Reset Request", // Subject line
        html: "<p>A password reset has been requested.  Please click this link to reset the password. <br\> " + link + "</p>"// plain text body
      };
     
      mail.SendMail(mailOptions);
      res.render('resetSuccess');
    }
    else {
      res.render('resetFail');
    }

  });

  function setUserReset(email, token) {
    var date = Date.now() + 3600000;
    var dateReset = new Date(date).toISOString().slice(0, 19).replace('T', ' ');

    mysql.pool.query("Select * FROM users where email = ?", [email], function (err, result, fields) {
      if (err) {
        return false;
      };
      if (result.length == 1) {

        mysql.pool.query("update users set reset_token = ?, reset_timeout = ? where email = ?", [token, dateReset, email], function (err, result) {
          if (err) {
            return false;
          };
        });
      }
      else {
        return false;
      }
    });
    return true;
  }


  return router;
}();