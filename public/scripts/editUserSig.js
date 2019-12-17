module.exports = function () {
  var express = require('express');
  var isGeneral = require('../../generalUserCheck.js');
  var router = express.Router();
  var cloudinary = require('cloudinary').v2;
  var mysql2 = require('../../dbcon.js');
  var fs = require('fs');
  let multer = require('multer');
  let upload = multer({ storage: multer.memoryStorage() }).single('sig');
  const path = __basedir;

  //cloudinary setup
  cloudinary.config({
    cloud_name: 'hxtcblmbp',
    api_key: '497354259889361',
    api_secret: 'BAqhQC6iUvwXi-Jr46q_2nPHu_4'
  });


  router.get('/', isGeneral, function (req, res) {
    let context = {};
    context.userPage = true;
    res.render('editUserSig', context);
  });

  
  router.post('/', isGeneral, function (req, res) {
    //https://github.com/expressjs/multer
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
      } else if (err) {
        // An unknown error occurred when uploading.
      }

      var user_id = req.session.user_id;
      var shortname = "user_" + user_id + "_sig.png"
      var fileFullName = path + "/Temp/" + shortname;
      //need to save file to local file system before uploading:  convert to buffere from dataURL
      var data = req.body.sig.replace(/^data:image\/\w+;base64,/, "");
      var buf = new Buffer(data, 'base64');
      fs.writeFile(fileFullName, buf, function (err) {
        // If an error occurred, show it and return
        if (err) return console.error(err);
        // Successfully wrote binary contents to the file!
        cloudinary.uploader.upload(fileFullName,
          {
            public_id: shortname
          }, function (result) {

          }
        ).then(function (image) {
          mysql2.pool.query("UPDATE users set signature_path = ? where id = ?", [image.secure_url, user_id], function (error, results, fields) {
            if (error) {

            }
            //remove temp file
            fs.unlinkSync(fileFullName);

            let context = {};
            context.userPage = true;
            res.render('userHome', context);

          });
        }
        );
      });


    })

  });

  return router;
}();