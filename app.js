
var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
var bodyParser = require('body-parser');
var mysql = require('./dbcon.js');
var session = require('express-session');
var bcrypt = require('bcrypt');


global.__basedir = __dirname;

const saltRounds = 10;

const PORT = process.env.PORT || 5000

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', PORT);
app.set('mysql', mysql);
//Implementation for static found here:
//https://expressjs.com/en/starter/static-files.html


app.use('/adminHome', require('./public/scripts/adminHome.js'));
app.use('/addAdminUser', require('./public/scripts/addAdminUser.js'));
app.use('/addGeneralUser', require('./public/scripts/addGeneralUser.js'));
app.use('/businessIntelligence', require('./public/scripts/businessIntelligence.js'));
app.use('/viewAdmins', require('./public/scripts/viewAdmins.js'));
app.use('/viewGeneralUsers', require('./public/scripts/viewGeneralUsers.js'));
app.use('/editAdmin', require('./public/scripts/editAdmin.js'));
app.use('/editGeneralUserAdminSite', require('./public/scripts/editGeneralUserAdminSite.js'));
app.use('/', require('./public/scripts/landingPage.js'));
app.use('/userHome', require('./public/scripts/userHome.js'));
app.use('/editUserInfo', require('./public/scripts/editUserInfo.js'));
app.use('/editUserSig', require('./public/scripts/editUserSig.js'));
app.use('/createAward', require('./public/scripts/createAward.js'));
app.use('/awards', require('./public/scripts/awards.js'));
app.use('/currentTopEmployees', require('./public/scripts/currentTopEmployees.js'));
app.use('/forgotPassword', require('./public/scripts/forgotPassword.js'));
app.use('/unauthorized', require('./public/scripts/unauthorized.js'));



app.use('/static', express.static('public'));

// for parsing multipart/form-data
//https://www.tutorialspoint.com/expressjs/expressjs_form_data.htm
//app.use(upload.array()); 

app.get('/', function (req, res, next) {

  //res.render('home');
  res.render('landingPage');

});



//login logout logic and implementation inspired by the following site:
//https://www.codexpedia.com/node-js/a-very-basic-session-auth-in-node-js-with-express-js/
app.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
})

app.post('/login', function (req, res) {
  req.session.errorMessage = "";
  if (!req.body.Email || !req.body.Password) {
    req.session.errorMessage = "Invalid Login";
    res.redirect('/');
  }
  mysql.pool.query("select users.*, roles.role From Users inner join roles on users.role_id = roles.id where users.email = ?", [req.body.Email], function (err, rows, fields) {
    if (err) {
      req.session.errorMessage = "Invalid Login";
      res.redirect('/');
      return;
    }

    //res.status(200).json(rows);
    if (rows.length == 0) {
      req.session.errorMessage = "Invalid Login";
      res.redirect('/');
    }
    else {
      //valid data
      bcrypt.compare(req.body.Password, rows[0].password, function (err, result) {
        if (result == true) {
          req.session.role = rows[0].role;
          req.session.user_name = rows[0].user_name;
          req.session.user_id = rows[0].id;
          req.session.sig_path = rows[0].signature_path;
          req.session.save();
          switch (rows[0].role) {
            case "general":
              if (rows[0].signature_path === null || rows[0].signature_path === "") {
                res.redirect('/editUserSig');
              }
              else{
                res.redirect('/userHome');
              }
              
              break;
            case "admin":
            case "superAdmin":
              res.redirect('/adminHome');
              break;
            default:
              req.session.errorMessage = "Invalid Login";
              res.redirect('/');
              break;
          }
        } else {
          req.session.errorMessage = "Invalid Login";
          res.redirect('/');
        }
      })
    };
  });
})

app.use(function (req, res) {
  res.status(404);
  res.render('404');
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});





app.listen(app.get('port'), function () {
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});