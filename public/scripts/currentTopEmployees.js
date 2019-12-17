module.exports = function(){
    var express = require('express');
	var isGeneral = require('../../generalUserCheck.js');
    var router = express.Router();

 
    function getCurrentEmployeeWeek(req, res, mysql, context, complete) {
        var sql = "SELECT recipient, recipient_email, award_date FROM awards WHERE award_date IN (SELECT max(award_date) FROM awards WHERE user_id = ? AND award_type_id = 11) LIMIT 1;"
		var inserts = [req.session.user_id];
		sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
			
			if (results[0] != null){
				context.week_recipient = results[0].recipient;
				context.week_recipient_email = results[0].recipient_email;
				context.week_award_date = results[0].award_date;
			}
			complete();
        });
    }; 
	
    function getCurrentEmployeeMonth(req, res, mysql, context, complete) {
        var sql = "SELECT recipient, recipient_email, award_date FROM awards WHERE award_date IN (SELECT max(award_date) FROM awards WHERE user_id = ? AND award_type_id = 1) LIMIT 1;"
		var inserts = [req.session.user_id];
		sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
			
			if (results[0] != null){
				context.month_recipient = results[0].recipient;
				context.month_recipient_email = results[0].recipient_email;
				context.month_award_date = results[0].award_date;
			}
			complete();
        });
	};

    function getCurrentEmployeeYear(req, res, mysql, context, complete) {
        var sql = "SELECT recipient, recipient_email, award_date FROM awards WHERE award_date IN (SELECT max(award_date) FROM awards WHERE user_id = ? AND award_type_id = 21) LIMIT 1;"
		var inserts = [req.session.user_id];
		sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
			
			if (results[0] != null){
				context.year_recipient = results[0].recipient;
				context.year_recipient_email = results[0].recipient_email;
				context.year_award_date = results[0].award_date;
			}
			complete();
        });
	};

	router.get('/', isGeneral, function(req, res){
		var callbackCount = 0;
		let context = {};
		context.week_recipient = "N/A";
		context.week_recipient_email = "N/A";
		context.week_award_date = "N/A";
		context.month_recipient = "N/A";
		context.month_recipient_email = "N/A";
		context.month_award_date = "N/A";
		context.year_recipient = "N/A";
		context.year_recipient_email = "N/A";
		context.year_award_date = "N/A";
		var mysql = req.app.get('mysql');
		getCurrentEmployeeWeek(req, res, mysql, context, complete);
		getCurrentEmployeeMonth(req, res, mysql, context, complete);
		getCurrentEmployeeYear(req, res, mysql, context, complete);
		context.userPage = true;
		function complete(){
			callbackCount++;
			if(callbackCount >= 3){
				res.render('currentTopEmployees', context);
			}
		}
	});   
    
    return router;
}();