module.exports = function(){

  var nodemailer = require('nodemailer');
  var fs = require('fs');
  this.toEmail = "";
  this.resetLink = "";
  this.subject = "";
  this.html = "";

  this.transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: 'cchincinfo@gmail.com',
           pass: 'E=^8-!@TD&X%mi9*2?YH'
       }
   });


  this.SendMail = function (mailOptions) {
    // updateMailOptions();
    var sent = false;
    this.transporter.sendMail(mailOptions, function (err, info) {
      if(err)
        console.log(err);
        
      else
        console.log(info);
        sent = true;
    });
    return sent;
  }



  
}