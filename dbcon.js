var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'us-cdbr-iron-east-05.cleardb.net',
  user            : 'b006de50873108',
  password        : '6afbab96',
  database        : 'heroku_0ca5a89c77f858d'
});

module.exports.pool = pool;
