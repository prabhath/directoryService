var express = require('express');
var router = express.Router();
var url = require("url");
var mysql = require('mysql');
var queries = require('../queries');
var utils = require('../utils');

var pool = mysql.createPool({
    connectionLimit: 20, //important
    host: 'dev-reportsng.leapset.com',
    user: 'root',
    password: 'gvt123',
    database: 'CONTACTS'
});

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Welcome to Sysco direcotry'});
});

router.get('/getByName', function (req, res) {

    console.log('getByName called');

    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var firstName = query.firstName;
    var lastName = query.lastName;

    var querySQL;
    var params = [];

    if (!utils.isUndefinedOrNull(firstName) && utils.isUndefinedOrNull(lastName)) {
        querySQL = queries.GET_TP_NO_BY_FIRST_NAME;
        params.push(utils.getParamForLikeQuery(firstName));
    } else if (utils.isUndefinedOrNull(firstName) && !utils.isUndefinedOrNull(lastName)) {
        querySQL = queries.GET_TP_NO_BY_LAST_NAME;
        params.push(utils.getParamForLikeQuery(lastName));
    } else if (!utils.isUndefinedOrNull(firstName) && !utils.isUndefinedOrNull(lastName)) {
        querySQL = queries.GET_TP_NO_BY_FULL_NAME;
        params.push(utils.getParamForLikeQuery(firstName));
        params.push(utils.getParamForLikeQuery(lastName));
    } else {
        querySQL = queries.GET_ALL_TP_NOS;
    }

    console.log('firstName:', firstName);
    console.log('lastName:', firstName);

    pool.getConnection(function (err, connection) {
        connection.query(querySQL, params, function (err, rows) {
            connection.release();
            if (err) throw err;
            console.log('Result for get by name', params, rows);
            res.json({"result": rows});
        });
    });

});

router.get('/getByNameAndState', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var ids = query.ids.split(',');
    var state = query.state;

    var querySQL = queries.GET_TP_NO_BY_STATE;

    pool.getConnection(function (err, connection) {
        connection.query(querySQL, [state, ids], function (err, rows) {
            connection.release();
            if (err) throw err;
            console.log('Result for get by state and name', [state, ids], rows);
            res.json({"result": rows});
        });
    });

});

router.get('/getByNameAndDepartment', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var ids = query.ids.split(',').map(Number);
    var dep = query.dep;
    console.log("getByNameAndDepartment", dep, ids);

    var querySQL = queries.GET_TP_NO_BY_DEPARTMENT_AND_IDS;

    pool.getConnection(function (err, connection) {
        connection.query(querySQL, [dep, ids], function (err, rows) {
            connection.release();
            if (err) throw err;
            console.log('Result for get by department and name', [dep, ids], rows);
            res.json({"result": rows});
        });
    });
});


router.get('/getByDepartment', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var dep = query.dep;

    var querySQL = queries.GET_TP_NO_BY_DEPARTMENT;

    pool.getConnection(function (err, connection) {
        connection.query(querySQL, [dep], function (err, rows) {
            connection.release();
            if (err) throw err;
            console.log('Result for get by department', [dep], rows);
            res.json({"result": rows});
        });
    });
});

router.get('/getByDepartmentAndState', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var state = query.state;
    var dep = query.dep;

    var querySQL = queries.GET_TP_NO_BY_DEPARTMENT_AND_STATE;

    pool.getConnection(function (err, connection) {
        connection.query(querySQL, [dep, state], function (err, rows) {
            connection.release();
            if (err) throw err;
            console.log('Result for get by department and state', [dep, state], rows);
            res.json({"result": rows});
        });
    });
});

router.get('/getTransfer', function (req, res) {
    var querySQL = queries.GET_FLAG_BY_NAME;

    pool.getConnection(function (err, connection) {
        connection.query(querySQL, ['TRANSFER'], function (err, rows) {
            connection.release();
            if (err) throw err;
            console.log('Result for get transfer state', rows);
            if (rows.length > 0) {
                var temp = rows[0];
                temp.message = "This is a test message";
                res.json({"result": temp});
            } else {
                res.json({"result": null});
            }
        });
    });
});

router.get('/setTransfer', function (req, res) {
    var querySQL = queries.SET_FLAG_BY_NAME;
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var state = JSON.parse(query.state);
    query = query.query;

    pool.getConnection(function (err, connection) {
        connection.query(querySQL, [state, query, 'TRANSFER'], function (err, rows) {
            connection.release();
            if (err) throw err;
            console.log('Set transfer state', state);
            res.json({"result": rows});
        });
    });
});


module.exports = router;
