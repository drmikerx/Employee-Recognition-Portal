module.exports = function () {
  var express = require('express');
  var isGeneral = require('../../generalUserCheck.js');
  var router = express.Router();
  var mailer = require('./mailer.js');
  var fs = require('fs');
  var https = require('https');
  var cloudinary = require('cloudinary').v2;
  var mysql2 = require('../../dbcon.js');
  const path = __basedir;
  const latex = require('node-latex')
  var dateFormat = require('dateformat');
  const Verifier = require("email-verifier");

  //Cloudinary setup
  cloudinary.config({
    cloud_name: 'hxtcblmbp',
    api_key: '497354259889361',
    api_secret: 'BAqhQC6iUvwXi-Jr46q_2nPHu_4'
  });
  //Download the user signature file.  Modified From:
  //https://repl.it/@lordproud/Downloading-file-in-nodejs
  const downloadFile = (url, dest, callback) => {
    console.log("starting download");
    const file = fs.createWriteStream(dest);
    file.on('error', function (err) {
      console.log(err);
      file.end();
    });
    const req = https.get(url, (res) => {

      if (res.statusCode !== 200) {
        return callback('File is not found');
      }
      const len = parseInt(res.headers['content-length'], 10);
      let dowloaded = 0;
      console.log("starting pipe");
      res.pipe(file);
      res.on('data', (chunk) => {
        dowloaded += chunk.length;
        console.log("Downloading " + (100.0 * dowloaded / len).toFixed(2) + "% " + dowloaded + " bytes" + "\r");
      }).on('end', () => {
        file.end();
        callback(null);
      }).on('error', (err) => {
        console.log("Error:  err");
        callback(err.message);
      })

    }).on('error', (err) => {
      fs.unlink(dest);
      callback(err.message);
    });

  }

  //generate the pdf
  async function GetPDF(inputFileName, outputFileName) {
    return new Promise(resolve => {
      const input = fs.createReadStream(inputFileName)
      const output = fs.createWriteStream(outputFileName)

      const options = {
        errorLogs: 'latexerrors.log' // This will write the errors to `latexerrors.log`
      }

      latex(input, options).pipe(output)
      output.on('finish', resolve);
    })
  }
  //wrtie the file locally
  async function createInputFile(inputFileName, doc) {
    fs.writeFileSync(inputFileName, doc);

  }
  //get the number for unique pdf file name
  async function getNumberOfUserAwards(recipient_email) {

    return new Promise(resolve => {

      mysql2.pool.query("SELECT Count(*) as CNT FROM awards where awards.recipient_email = ?", [recipient_email], function (error, results, fields) {
        if (error) {

        }

        resolve(results[0].CNT);

      });
    })
  }
  //create the tex file
  async function generateDocString(data, tempFile) {

    return new Promise(resolve => {
      mysql2.pool.query("SELECT user_name  FROM users where users.id = ?", [data[0]], function (error, results, fields) {
        if (error) {

        }
        mysql2.pool.query("SELECT award_type FROM award_types where award_types.id = ?", [data[1]], function (error, results2, fields) {
          if (error) {

          }
          var tempFileAlt = tempFile.replace(/\\/g, "/");
          var date = new Date(data[4]);

          var newDate = dateFormat(date, "dddd, mmmm dS, yyyy, h:MM:ss TT");
          const test = `\\documentclass{article}
        \\usepackage{graphicx}
        \\pagenumbering{gobble}
        \\begin{document}
        \\begin{center}
        \\Huge Congratulations
        
        \\section*{${data[2]}}
        \\normalsize Has been presented with the following award:\\\\
        \\vspace{15mm}
        \\LARGE ${results2[0].award_type}
        \\vspace{5mm}
        
        \\section*{Presented By}
        \\large ${results[0].user_name} \\\\
        on \\\\
        ${newDate.toString()}
        \\end{center}
        
        \\begin{flushright}
        \\vspace{15mm}
        \\includegraphics{${tempFileAlt}}
        \\end{flushright}
        
        
        \\end{document}`;
          resolve(test);


        });


      });
    })
  }

  //get the signature file of the user
  async function downloadUserSig(user_id) {
    return new Promise(resolve => {

      mysql2.pool.query("SELECT Distinct signature_path FROM users where users.id = ?", [user_id], function (error, results, fields) {
        if (error) {

        }
        var url = results[0].signature_path;
        if (url === null || url === "") {
          resolve(null);
        }
        var extension = url.substring(url.lastIndexOf("."), url.length);
        var filename = path + "/Temp/" + "tempSig_" + user_id + extension;
        downloadFile(url, filename, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log('File is downloaded');
            
          }
          resolve(filename);
        });
        

      });
    })

  }
  //generate the doc; upload; and send mail
  async function createDocument(data) {
    //download user sig
    var tempFile = await downloadUserSig(data[0]);
    //generate text
    var doc = await generateDocString(data, tempFile);

    //save to file
    var countOfAwards = await getNumberOfUserAwards(data[3]);

    var inputFileName = path + "/Temp/user_award_" + data[0] + ".tex";
    var outputFileName = path + "/Temp/user_award_" + data[0] + "_" + countOfAwards + ".pdf";
    var shortname = "user_award_" + data[0] + "_" + countOfAwards;
    await createInputFile(inputFileName, doc);
    //convert to pdf
    await GetPDF(inputFileName, outputFileName);
    //delete first file
    fs.unlinkSync(inputFileName)
    //delete local user sig
    fs.unlinkSync(tempFile);
    //upload to cloudinary
    cloudinary.uploader.upload(outputFileName,
      {
        public_id: shortname
      }, function (result) {

      }
    ).then(function (image) {
      //returned image info  mail award
      var mail = new mailer();
      var url = image.secure_url;
      var mailOptions = {
        from: 'cchincinfo@gmail.com', // sender address
        to: data[3], // list of receivers
        subject: "CCH Awards: Congratulations on your award!", // Subject line
        html: "<p>You have been granted an award! View the attached PDF for details.</p><br/><p>You can also access your award at <a href='" + url + "' >Click Here</a></p>",// plain text body
        attachments: [
          {   // utf-8 string as an attachment
            filename: shortname + ".pdf",
            path: url // stream this file
          }]
      };

      mail.SendMail(mailOptions);
      //delete temp file
      fs.unlinkSync(outputFileName);


      // 
    });
    //send email
    //delete second file

  }

  //get the different types of awards
  function getAwardTypes(res, mysql, context, complete) {
    mysql.pool.query("SELECT id, award_type FROM award_types;", function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }

      context.types = results;
      complete();
    });
  }

  //save an award record and create and send the document
  function postAward(req, res, mysql, complete) {
    let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let inputDate = req.body.date + " " + req.body.time + ":00";
    let inserts = [req.session.user_id, req.body.type, req.body.name, req.body.email, inputDate, date];
    mysql.pool.query("INSERT INTO awards (user_id, award_type_id, recipient, recipient_email, award_date, award_create_date) VALUES (?,?,?,?,?,?);", inserts, function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      createDocument(inserts);


      complete();
    })
  }

  router.get('/', isGeneral, function (req, res) {
    var callbackCount = 0;
    let context = {};
    var mysql = req.app.get('mysql');
    getAwardTypes(res, mysql, context, complete);
    context.userPage = true;
    function complete() {
      callbackCount++;
      if (callbackCount >= 1) {
        res.render('createAward', context);
      }
    }
  });


  router.post('/', isGeneral, async function (req, res) {
    let context = {};
    req.session.errorMessage = "";

    let callbackCount = 0;
    const isValid = await validateData(req);
    if (isValid) {
      var mysql = req.app.get('mysql');
      postAward(req, res, mysql, complete);
      function complete() {
        callbackCount++;
        if (callbackCount >= 1) {
          res.redirect('/userHome');
        }
      }
    }
    else {
      let mysql = req.app.get('mysql');
      context.types = await getAwardTypesAsync(res, mysql, context, complete);
      context.userPage = true;
      context.errorText = req.session.errorMessage;
      res.render('createAward', context);
      delete req.session.errorText;
    }

  });

  //function to get award types with the ability to wait on the response
  async function getAwardTypesAsync(res, mysql, context) {
    return new Promise(resolve => {
      mysql.pool.query("SELECT id, award_type FROM award_types;", function (error, results, fields) {
        if (error) {
          res.write(JSON.stringify(error));
          res.end();
        }

        resolve(results);

      });
    });
  }

  //validate the reciepient email as well as the existence of the signature path
  //modified from documentation:  https://www.npmjs.com/package/email-verifier
  async function validateData(req) {
    return new Promise(resolve => {
      let verifier = new Verifier("at_l8554Tho4csZodAebUyo96AOpLnrQ");
      //validate the email
      verifier.verify(req.body.email, (err, data) => {
        if (err) {
          req.session.errorMessage += "\nError Processing the email.";
          resolve(false);
        }
        if (data.dnsCheck === "true" && data.formatCheck === "true") {
          //validate the sig path
          mysql2.pool.query("SELECT Distinct signature_path FROM users where users.id = ?", [req.session.user_id], function (error, results, fields) {
            if (error) {
              req.session.errorMessage += "\nError checking signature path.";
            }
            var url = results[0].signature_path;
            if (url === null || url === "") {
              req.session.errorMessage += "\nUser doesn't have signature path.";
            }

          });
        }
        else {
          req.session.errorMessage += "\nInvalid email address.";
        }
        if (req.session.errorMessage === "") {
          resolve(true);
        }
        else {
          resolve(false);
        }
      });
    });
  }

  return router;
}();