var express 	= require('express');
var schedule 	= require('node-schedule');
var request 	= require('request');
var mongodb 	= require('mongodb');
// var xmlreader 	= require('xmlreader');
var extend		= require('xtend');

var app = express();
app.use(express.bodyParser());

// 設定 mongodb 位置, port
var mongodbServer = new mongodb.Server('localhost', 27017, {
	auto_reconnect: true
});

// 產生物件,指定 Log
// 格式:
var db = new mongodb.Db('jobs', mongodbServer, {
	safe: true
});

db.open(function(err) {
	if (err) {
		console.log(err);
		return;
	}
});

/*
 *	actions
 *
 */
var actions = {};

actions.push = function(postData, date) {
	console.log('doing a job that is scheduled @%s', date);
	console.log(' -- post data --');
	console.log('%j', postData);
	console.log(' -- end -- ');

	request.post('http://www.baohunter.com/api/push_all_user', {
		form: postData
	}, function(error, response, body) {
		console.log(body);
	});
};

/**
 *	[fields]
 *
 *	dothis	`string` the action to perform
 *	when	`string` the time action to perform
 *	(other) `any` fields depends on the action
 *
 */
app.post('/schedule', function(req, res) {


	// if (!req.body.to && !req.body.cc && !req.body.bcc) {
	// 	res.json(406, {
	// 		success: false,
	// 		error: 'Sender is empty.'
	// 	});
	// 	return;
	// }
	var postData = extend({}, req.body);

	var date = new Date(postData.when);
	delete postData.when;

	if (date == 'Invalid Date') {
		res.json(400, {
			success: false,
			error: 'Invalid Date'
		});
		res.end();
		return;
	}

	var requestAction = actions[postData.dothis];
	delete postData.dothis;
	if (!requestAction) {
		res.json(400, {
			success: false,
			error: 'action not found'
		});
		res.end();
		return;
	}

	console.log('[New Job] @%s %j', date, postData);
	var job = schedule.scheduleJob(date, requestAction.bind(this, req.body, date));

	res.json(200, {
		success: true,
		scheduledTime: date
	});
	res.end();

});

app.listen(3003);