module.exports = function(){
    var express = require('express');
    var router = express.Router();

    var Chart = require('chart.js');

    const { AsyncParser } = require('json2csv');

    var isAdmin = require('../../adminCheck.js');


    function createAwardByMonthObject(month) {
        this.month = month;
        this.award_count = 0;       // Will be incremented as needed
    }

    function createAwardByTypeObject(type, count) {
        this.award_type = type;
        this.award_count = count;
    }

    function createUserAwardCountObject(email, count) {
        this.user_email = email;
        this.award_creation_count = count;
    }


    function getAwardsByMonthCSV(res, mysql, dataToSendShell, complete) {
        // Populate the dataToSend array of objects

        dataToSendShell.dataToSend.push(new createAwardByMonthObject("January"));
        dataToSendShell.dataToSend.push(new createAwardByMonthObject("February")); 
        dataToSendShell.dataToSend.push(new createAwardByMonthObject("March"));
        dataToSendShell.dataToSend.push(new createAwardByMonthObject("April"));
        dataToSendShell.dataToSend.push(new createAwardByMonthObject("May"));
        dataToSendShell.dataToSend.push(new createAwardByMonthObject("June"));
        dataToSendShell.dataToSend.push(new createAwardByMonthObject("July"));
        dataToSendShell.dataToSend.push(new createAwardByMonthObject("August"));
        dataToSendShell.dataToSend.push(new createAwardByMonthObject("September"));
        dataToSendShell.dataToSend.push(new createAwardByMonthObject("October"));
        dataToSendShell.dataToSend.push(new createAwardByMonthObject("November"));
        dataToSendShell.dataToSend.push(new createAwardByMonthObject("December"));

        // Get award count data

        mysql.pool.query("SELECT MONTH(award_date) AS `award_months` FROM awards;", function(error, results, fields) {
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }

            else {

                var numUpdatesDone = 0;
                var numUpdatesNeeded = results.length;
                // Increment the count of each month by 1 as it's seen

                for(item of results) {
                    var monthToIncrease = item.award_months;
                    dataToSendShell.dataToSend[monthToIncrease - 1].award_count = dataToSendShell.dataToSend[monthToIncrease - 1].award_count + 1;
                    numUpdatesDone++;
                    if(numUpdatesDone === numUpdatesNeeded) {
                        complete();
                    }
                }

            }
        });
    }


    function getAwardsByTypeCSV(res, mysql, dataToSendShell, complete) {

        // Get the names of the award types
        mysql.pool.query("SELECT id, award_type FROM award_types;", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }

            else {
                var award_type_values = [];
                for(item of results){
                    award_type_values.push(item.award_type);
                }

                // Now we need the number of each award type in the database

                var sqlForAwardTypeCount = "SELECT awdt.id, awdt.award_type AS `award_type_name`, a.award_type_id AS `award_type`, COUNT(*) AS `typeCount` FROM awards a INNER JOIN award_types awdt ON awdt.id = a.award_type_id WHERE a.award_type_id = ?;";

                var award_count_values = [];
                for(let i=0; i < award_type_values.length; i++){
                    award_count_values[i] = 0;
                }

                var numQueriesDone = 0;
                var numQueriesNeeded = award_type_values.length;

                for(item of results){
                    var inserts = [item.id];
                    mysql.pool.query(sqlForAwardTypeCount, inserts, function(error, results, fields) {
                        if(error){
                            res.write(JSON.stringify(error));
                            res.end();
                        }

                        else {
                            var locationToAdd = award_type_values.indexOf(results[0].award_type_name);
                            award_count_values[locationToAdd] = results[0].typeCount;
                            numQueriesDone++;
                            if(numQueriesDone === numQueriesNeeded){
                                
                                for(let i=0; i < award_type_values.length; i++) {
                                    dataToSendShell.dataToSend.push(new createAwardByTypeObject(award_type_values[i], award_count_values[i]));
                                }
                                

                                complete();
                            }
                        }
                    });

                }
            }

        });
    }


    function getAwardCreationCountCSV(res, mysql, dataToSendShell, complete) {

        mysql.pool.query("SELECT id FROM roles WHERE role = 'general';", function(error, results, fields) {
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }

            else {
                var generalUserRoleId = results[0].id;
                var sqlForGeneralUsers = "SELECT id, email FROM users WHERE role_id = ? ORDER BY id";
                var inserts = [generalUserRoleId];

                sqlForGeneralUsers = mysql.pool.query(sqlForGeneralUsers, inserts, function(error, results, fields) {
                    if(error){
                        res.write(JSON.stringify(error));
                        res.end();
                    }

                    else {
                        var email_values = [];
                        for(item of results){
                            email_values.push(item.email);
                        }

                        // Now need to get the number of awards each user created

                        var sqlForAwardCount = "SELECT u.id, u.email AS `email`, a.user_id AS `user_id`, COUNT(*) AS `awardCount` FROM awards a INNER JOIN users u ON u.id = a.user_id WHERE a.user_id = ?;";

                        var award_count_values = [];
                        for(let i=0; i < email_values.length; i++){
                            award_count_values[i] = 0;
                        }

                        var numQueriesDone = 0;
                        var numQueriesNeeded = email_values.length;

                        for(item of results){
                            var inserts = [item.id];
                            mysql.pool.query(sqlForAwardCount, inserts, function(error, results, fields) {
                                if(error){
                                    res.write(JSON.stringify(error));
                                    res.end();
                                }

                                else {
                                    var locationToAdd = email_values.indexOf(results[0].email);
                                    award_count_values[locationToAdd] = results[0].awardCount;
                                    numQueriesDone++;
                                    if(numQueriesDone === numQueriesNeeded){
                                        
                                        for(let i=0; i < email_values.length; i++) {
                                            dataToSendShell.dataToSend.push(new createUserAwardCountObject(email_values[i], award_count_values[i]));
                                        }
                                        
        
                                        complete();
                                    }
                                }
                            });

                        }

                    }

                });

            }

        });

    }


    function getAwardCountData(res, mysql, dataToSend, complete) {
        // Get the list of general users in the database

        mysql.pool.query("SELECT id FROM roles WHERE role = 'general';", function(error, results, fields) {
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }

            else {
                var generalUserRoleId = results[0].id;
                var sqlForGeneralUsers = "SELECT id, email FROM users WHERE role_id = ? ORDER BY id";
                var inserts = [generalUserRoleId];
                
                sqlForGeneralUsers = mysql.pool.query(sqlForGeneralUsers, inserts, function(error, results, fields) {
                    if(error){
                        res.write(JSON.stringify(error));
                        res.end();
                    }

                    else {
                        var xAxisValues = [];
                        for(item of results){
                            xAxisValues.push(item.email);
                        }

                        dataToSend.xAxis = xAxisValues;
                        dataToSend.label = "# of awards created";
                        dataToSend.backgroundColor = [];
                        dataToSend.borderColor = [];

                        for(let i=0; i < xAxisValues.length; i++){
                            if(i % 2 === 0) {
                                dataToSend.backgroundColor.push('rgba(255, 99, 132, 0.2)');
                                dataToSend.borderColor.push('rgba(255, 99, 132, 1)');
                            }

                            else{
                                dataToSend.backgroundColor.push('rgba(54, 162, 235, 0.2)');
                                dataToSend.borderColor.push('rgba(54, 162, 235, 1)');
                            }
                        }

                        // Now need to get the number of awards each user created

                        var sqlForAwardCount = "SELECT u.id, u.email AS `email`, a.user_id AS `user_id`, COUNT(*) AS `awardCount` FROM awards a INNER JOIN users u ON u.id = a.user_id WHERE a.user_id = ?;";

                        var yAxisValues = [];
                        for(let i=0; i < xAxisValues.length; i++){
                            yAxisValues[i] = 0;
                        }

                        var numQueriesDone = 0;
                        var numQueriesNeeded = xAxisValues.length;


                        for(item of results){
                            var inserts = [item.id];
                            mysql.pool.query(sqlForAwardCount, inserts, function(error, results, fields) {
                                if(error){
                                    res.write(JSON.stringify(error));
                                    res.end();
                                }

                                else {
                                    var locationToAdd = xAxisValues.indexOf(results[0].email);
                                    yAxisValues[locationToAdd] = results[0].awardCount;
                                    numQueriesDone++;
                                    if(numQueriesDone === numQueriesNeeded){
                                        dataToSend.yAxis = yAxisValues;
                                        
        
                                        complete();
                                    }
                                }
                            });

                        }

                    }
                });
            }
        });

    }

    function getAmountOfEachType(res, mysql, dataToSend, complete) {

        // Get the list of award types from the database for the X-axis

        mysql.pool.query("SELECT id, award_type FROM award_types;", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }

            else {
                var xAxisValues = [];
                for(item of results){
                    xAxisValues.push(item.award_type);
                }

                dataToSend.xAxis = xAxisValues;
                dataToSend.label = "# of awards of each type";
                dataToSend.backgroundColor = [];
                dataToSend.borderColor = [];

                for(let i=0; i < xAxisValues.length; i++){
                    if(i % 2 === 0) {
                        dataToSend.backgroundColor.push('rgba(255, 99, 132, 0.2)');
                        dataToSend.borderColor.push('rgba(255, 99, 132, 1)');
                    }

                    else{
                        dataToSend.backgroundColor.push('rgba(54, 162, 235, 0.2)');
                        dataToSend.borderColor.push('rgba(54, 162, 235, 1)');
                    }
                }


                // Now we need the number of each award type in the database

                var sqlForAwardTypeCount = "SELECT awdt.id, awdt.award_type AS `award_type_name`, a.award_type_id AS `award_type`, COUNT(*) AS `typeCount` FROM awards a INNER JOIN award_types awdt ON awdt.id = a.award_type_id WHERE a.award_type_id = ?;";

                var yAxisValues = [];
                for(let i=0; i < xAxisValues.length; i++){
                    yAxisValues[i] = 0;
                }

                var numQueriesDone = 0;
                var numQueriesNeeded = xAxisValues.length;

                for(item of results){
                    var inserts = [item.id];
                    mysql.pool.query(sqlForAwardTypeCount, inserts, function(error, results, fields) {
                        if(error){
                            res.write(JSON.stringify(error));
                            res.end();
                        }

                        else {
                            var locationToAdd = xAxisValues.indexOf(results[0].award_type_name);
                            yAxisValues[locationToAdd] = results[0].typeCount;
                            numQueriesDone++;
                            if(numQueriesDone === numQueriesNeeded){
                                dataToSend.yAxis = yAxisValues;
                                

                                complete();
                            }
                        }
                    });

                }
            }
        });


    }

    function getAmountByMonth(res, mysql, dataToSend, complete) {

        // Get an array of integers representing the months of the year

        mysql.pool.query("SELECT MONTH(award_date) AS `award_months` FROM awards;", function(error, results, fields) {
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }

            else {
                var xAxisValues = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                var yAxisValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                // Increment the count of each month by 1 as it's seen

                for(item of results) {
                    var monthToIncrease = item.award_months;
                    yAxisValues[monthToIncrease - 1] = yAxisValues[monthToIncrease - 1] + 1;
                }

                dataToSend.xAxis = xAxisValues;
                dataToSend.label = "# of awards given in month";
                dataToSend.yAxis = yAxisValues;

                dataToSend.backgroundColor = [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ];

                dataToSend.borderColor = [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ];

                complete();

            }

        });


    }

  
  // Display the business intelligence page (came from regular browser call - NOT chart request)
  
  router.get('/', isAdmin, function(req, res){
        let context = {};
        context.adminPage = true;
        context.jsscripts = ["chartBuilder.js"];

        res.render('businessIntelligence', context);
    });


    // Comes from AJAX on client side

    router.get('/awardCount', isAdmin, function(req, res) {
        var callbackCount = 0;
        var dataToSend = {};
        var mysql = req.app.get('mysql');
        getAwardCountData(res, mysql, dataToSend, complete);

        function complete() {   // Send formatted data when everything in dataToSend is correctly set up
            callbackCount++;
            if (callbackCount >= 1) {
                var formattedDataToSend = JSON.stringify(dataToSend);
                res.send(formattedDataToSend);
            }
        }

    });


    router.get('/amountOfEachType', isAdmin, function(req, res) {
        var callbackCount = 0;
        var dataToSend = {};
        var mysql = req.app.get('mysql');
        getAmountOfEachType(res, mysql, dataToSend, complete);

        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                var formattedDataToSend = JSON.stringify(dataToSend);
                res.send(formattedDataToSend);
            }
        }

    });


    router.get('/awardsByMonth', isAdmin, function(req, res) {
        var callbackCount = 0;
        var dataToSend = {};
        var mysql = req.app.get('mysql');
        getAmountByMonth(res, mysql, dataToSend, complete);

        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                var formattedDataToSend = JSON.stringify(dataToSend);
                res.send(formattedDataToSend);
            }
        }
    });

    // Number of awards created by users CSV handler

    router.get('/getUserAwardCountCSV', isAdmin, function(req, res) {
        var callbackCount = 0;
        var dataToSendShell = {};   // So changes persist
        dataToSendShell.dataToSend = [];

        const fields = ['user_email', 'award_creation_count'];
        const opts = { fields };
        const transformOpts = { highWaterMark: 8192 };
        const asyncParser = new AsyncParser(opts, transformOpts);

        var mysql = req.app.get('mysql');
        getAwardCreationCountCSV(res, mysql, dataToSendShell, complete);

        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                var formattedDataToSend = JSON.stringify(dataToSendShell.dataToSend);

                let csv = '';
                asyncParser.processor
                .on('data', chunk => csv += chunk.toString())
                .on('end', () => {
                    res.setHeader('Content-disposition', 'attachment; filename=awards_created_by_users.csv');
                    res.set('Content-Type', 'text/csv');
                    res.status(200).send(csv);
                })
                .on('error', err => console.error(err));

                asyncParser.input.push(formattedDataToSend);
                asyncParser.input.push(null);
            }
        }

    });


    // Number of awards by type CSV handler

    router.get('/getAwardTypeCSV', isAdmin, function(req, res){
        var callbackCount = 0;
        var dataToSendShell = {};   // So changes persist
        dataToSendShell.dataToSend = [];

        const fields = ['award_type', 'award_count'];
        const opts = { fields };
        const transformOpts = { highWaterMark: 8192 };
        const asyncParser = new AsyncParser(opts, transformOpts);

        var mysql = req.app.get('mysql');
        getAwardsByTypeCSV(res, mysql, dataToSendShell, complete);

        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                var formattedDataToSend = JSON.stringify(dataToSendShell.dataToSend);

                let csv = '';
                asyncParser.processor
                .on('data', chunk => csv += chunk.toString())
                .on('end', () => {
                    res.setHeader('Content-disposition', 'attachment; filename=awards_by_type.csv');
                    res.set('Content-Type', 'text/csv');
                    res.status(200).send(csv);
                })
                .on('error', err => console.error(err));

                asyncParser.input.push(formattedDataToSend);
                asyncParser.input.push(null);
            }
        }

    });


    // Number of awards by month CSV handler

    router.get('/getAwardMonthsCSV', isAdmin, function(req, res){
        var callbackCount = 0;
        var dataToSendShell = {};   // So changes persist
        dataToSendShell.dataToSend = [];

        const fields = ['month', 'award_count'];
        const opts = { fields };
        const transformOpts = { highWaterMark: 8192 };
        const asyncParser = new AsyncParser(opts, transformOpts);

        var mysql = req.app.get('mysql');
        getAwardsByMonthCSV(res, mysql, dataToSendShell, complete);

        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                var formattedDataToSend = JSON.stringify(dataToSendShell.dataToSend);

                let csv = '';
                asyncParser.processor
                .on('data', chunk => csv += chunk.toString())
                .on('end', () => {
                    res.setHeader('Content-disposition', 'attachment; filename=awards_by_month.csv');
                    res.set('Content-Type', 'text/csv');
                    res.status(200).send(csv);
                })
                .on('error', err => console.error(err));

                asyncParser.input.push(formattedDataToSend);
                asyncParser.input.push(null);
            }
        }

    });
    
    
    return router;
}();