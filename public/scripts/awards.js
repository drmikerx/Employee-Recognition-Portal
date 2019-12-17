module.exports = function(){
    var express = require('express');
	var isGeneral = require('../../generalUserCheck.js');
    var router = express.Router();

    
    function getAwards(req, res, mysql, context, complete) {
        var sql = "SELECT awards.id, awards.recipient, awards.recipient_email, awards.award_date, award_types.award_type FROM awards LEFT JOIN award_types ON award_types.id = awards.award_type_id WHERE awards.user_id = ?";
		var inserts = [req.session.user_id];
		sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }

            context.awards = results;
            complete();
        });
    };
  
  router.get('/', isGeneral, function(req, res){
        var callbackCount = 0;
        let context = {};
        context.jsscripts = ["deleteAward.js"];
        
        var mysql = req.app.get('mysql');
        getAwards(req, res, mysql, context, complete);
        context.userPage = true;
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('awards', context);
            }
        }
    });

    router.delete('/:id', isGeneral, function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM awards WHERE id = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400).end();
            }

            else{
                res.status(202).end();
            }
        });
    });
    
    return router;
}();