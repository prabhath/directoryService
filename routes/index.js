var express = require('express');
var router = express.Router();
var url = require("url");
var mysql = require('mysql');
var queries=require('../queries');
var utils = require('../utils');

var pool = mysql.createPool({
    connectionLimit : 20, //important
    host     : 'dev-reportsng.leapset.com',
    user     : 'root',
    password : 'gvt123',
    database : 'CONTACTS'
});

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Welcome to Sysco direcotry'});
});

router.get('/getByName', function (req, res) {

    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var firstName = query.firstName;
    var lastName = query.lastName;

    var querySQL;
    var params=[];

    if(!utils.isUndefinedOrNull(firstName) && utils.isUndefinedOrNull(lastName)){
        querySQL= queries.GET_TP_NO_BY_FIRST_NAME;
        params.push(utils.getParamForLikeQuery(firstName));
    }else if(utils.isUndefinedOrNull(firstName) && utils.isUndefinedOrNull(lastName)){
        querySQL = queries.GET_TP_NO_BY_LAST_NAME;
        params.push(utils.getParamForLikeQuery(lastName));
    }else if(utils.isUndefinedOrNull(firstName) && utils.isUndefinedOrNull(lastName)){
        querySQL = queries.GET_TP_NO_BY_FULL_NAME;
        params.push(utils.getParamForLikeQuery(firstName));
        params.push(utils.getParamForLikeQuery(lastName));
    }

    pool.getConnection(function(err,connection){
        connection.query(querySQL, params, function(err, rows) {
            connection.release();
            if (err) throw err;
            console.log('Result for get by name', params, rows);
            res.json({"ok": rows});
        });
    });

});

router.get('/getByNameAndState', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var ids = query.ids.split(',');
    var state = query.state;

    var querySQL = queries.GET_TP_NO_BY_STATE;

    pool.getConnection(function(err,connection){
        connection.query(querySQL, [state,ids], function(err, rows) {
            connection.release();
            if (err) throw err;
            console.log('Result for get by state and name', [state,ids], rows);
            res.json({"ok": rows});
        });
    });

});

router.get('/getByNameAndDepartment', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var ids = query.ids.split(',');
    var dep = query.dep;

    var querySQL = queries.GET_TP_NO_BY_STATE;

    pool.getConnection(function(err,connection){
        connection.query(querySQL, [dep,ids], function(err, rows) {
            connection.release();
            if (err) throw err;
            console.log('Result for get by department and name', [state,ids], rows);
            res.json({"ok": rows});
        });
    });
});


router.get('/getByDepartment', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var dep = query.dep;

    var querySQL = queries.GET_TP_NO_BY_DEPARTMENT;

    pool.getConnection(function(err,connection){
        connection.query(querySQL, [dep], function(err, rows) {
            connection.release();
            if (err) throw err;
            console.log('Result for get by department', [dep], rows);
            res.json({"ok": rows});
        });
    });
});

router.get('/getByDepartmentAndState', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var state = query.state;
    var dep = query.dep;

    var querySQL = queries.GET_TP_NO_BY_DEPARTMENT_AND_STATE;

    pool.getConnection(function(err,connection){
        connection.query(querySQL, [dep,state], function(err, rows) {
            connection.release();
            if (err) throw err;
            console.log('Result for get by department and state', [dep,state], rows);
            res.json({"ok": rows});
        });
    });
});


module.exports = router;