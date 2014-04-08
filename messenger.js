// process.env.DEBUG = 'apn,tkm';   // used when debugging is needed, requires "debug" package

var extend      = require('xtend');

var nodemailer  = require('nodemailer');
var apn         = require('apn');
var gcm         = require('node-gcm');
var express     = require('express');
var winston     = require('winston');

var config      = require('./config');

var NOOP = function() {};
var debug = NOOP;

if (process.env.DEBUG) {
	try {
		debug = require('debug')('tkm');
	} catch (e) {
		console.log('Notice: `debug` module is not available. This should be installed with `npm install debug` to enable debug messages', e);
		debug = NOOP;
	}
}

var now = new Date();

function pad(n) {
	return n < 10 ? '0' + n : n
}
var date = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate());
var logFilename = 'logs/messenger_' + date + '.log';

winston.add(winston.transports.File, {
	filename: logFilename
});

// winston.remove(winston.transports.Console);

console.log('starting TK Mailer Service ...');
winston.log('info', 'starting TK Mailer Service ...');

var connections = {}

for (var name in config.targets) {

	var target = config.targets[name];

	winston.log('info', 'init connection ' + name);
	switch (target.type) {
		case 'apns':
			connections[name] = createConnectionAPNS(target);
			feedbackAPNS(target, name);
			break;

		case 'gcm':
			connections[name] = createConnectionGCM(target);
			break;

		default:
			winston.log('info', 'connection ' + name + 'not created');
			break;
	}
}

function createConnectionAPNS(target) {

	function errorCallback(err, notification) {
		if (err) {
			winston.log('error', err);
		} else {
			winston.log('info', 'createConnectionAPNS');
			winston.log('info', JSON.stringify(notification));
		}
	}

	//apn init
	var apnsOpt = {
		cert: target.cert,
		/* Certificate file path */
		key: target.key,
		error: errorCallback,
		connectionTimeout: 60000
	}

	if (target.debug) {
		apnsOpt.debug = true;
	}

	apnsOpt.gateway = target.gateway;

	return new apn.Connection(apnsOpt);
}

function createConnectionGCM(target) {
	return new gcm.Sender(target.apiKey);
}

function pushByAPNS(apnConnection, opt) {

	debug('pushing by apns');

	debug('opt:');
	debug(JSON.stringify(opt));

	var tokens = opt.tokens;
	delete opt.tokens;

	var defaultOpt = extend({
		badge: 1,
		expiry: 'default',
		sound: 'default'
	}, opt);

	//get special token and badge
	tokens.forEach(function(token, i) {

		var customOpt = {};

		if (typeof token === 'object') {
			customOpt = extend(customOpt, token);
			token = customOpt.token;
			delete customOpt.token;
		}

		var finalOpt = extend(defaultOpt, customOpt);

		if (!finalOpt.message) {
			winston.log('tkm', 'message is found empty');
			winston.log('tkm', JSON.stringify(finalOpt));
			return;
		}

		var notification = createAPNSNotification(finalOpt);

		apnConnection.pushNotification(notification, token);
	});

	// if( opt.payload ) {
	//     note.payload = opt.payload;
	// }

	return true;
}

function createAPNSNotification(opt) {
	//setup notification object

	var note = new apn.Notification();

	if (opt.sound == 'none') {
		//no sound
	} else if (opt.sound) {
		note.sound = opt.sound;
	} else {
		//default sound
		note.sound = 'default';
	}

	if (opt.badge > 0) {
		note.badge = opt.badge | 0;
	}

	if (!opt.expiry || opt.expiry == 'default') {
		note.expiry = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // Expires 1 day from now. (sec)
	} else if (opt.expiry > 0) {
		note.expiry = Math.floor(Date.now() / 1000) + (opt.expiry | 0);
	}

	note.alert = opt.message;

	return note;
}

function feedbackAPNS(target, name) {

	debug('feedback by apns');

	debug('target:');
	debug(JSON.stringify(target));

	//apn init
	var apnsOpt = {
		cert: target.cert,
		/* Certificate file path */
		key: target.key,
		batchFeedback: true,
		interval: 300,
		error: function(err, notification) {
			if (err) {
				winston.log('error', err);
			} else {
				winston.log('info', 'feedbackAPNS');
				winston.log('info', JSON.stringify(notification));
			}
		}
	}

	if (target.debug) {
		apnsOpt.debug = true;
	}

	// fix use feedback url
	apnsOpt.gateway = target.feedback;

	var feedback = new apn.Feedback(apnsOpt);

	feedback.on('feedback', function(devices) {
		devices.forEach(function(item) {
			// Do something with item.device and item.time;
			winston.log('tkm', name + ' ' + JSON.stringify(item));
		});
	});

	// console out feedback Error
	feedback.on('feedbackError', console.error);

	return true;
}

function pushByGCM(gcmSender, opt) {

	debug('pushing by gcm');

	debug('opt:');
	debug(JSON.stringify(opt));

	opt.retires = (opt.retires | 0) || 3;

	if (!Array.isArray(opt.tokens)) {
		opt.tokens = [opt.tokens];
	}

	var gcmMessage = new gcm.Message({
		delayWhileIdle: true,
		timeToLive: 3, //week
		data: {
			alert: opt.message
		}
	});

	if (opt.collapseKey) {
		gcmMessage.collapseKey = opt.collapseKey;
	}
	gcmMessage.delayWhileIdle = true;
	gcmMessage.timeToLive = 3;

	var tokens = opt.tokens;

	while (tokens.length) {
		var parts = tokens.splice(0, 1000);

		gcmSender.send(gcmMessage, parts, opt.retires, function(err, result) {
			if (err) {
				winston.log('tkm', 'gcm error');
				winston.log('tkm', JSON.stringify(result));
			}
		});
	}

	return true;
}

//app init
var app = express();
app.use(express.bodyParser());

app.use(function(req, res, next) {

	if (config.env == 'develop') {
		next();
		return;
	}

	// if( req.connection.remoteAddress != '127.0.0.1' ) {
	//     res.send(200);
	//     return;
	// }

	next();
});

/*
app.post('/email', emailService.page);
app.post('/email/send', emailService.send);
app.post('/email/query', emailService.query);
*/

/**
 *  Push message to mobile device
 *
 *  @param target: the environment to push, should be on of setup in config
 *  @param message: the message to showing up
 *  @param tokens: the device token to recieve push notice, andriod is called
 *
 *  [opt]: any param needed for target setup, ios and andriod could be different
 *  @param badge:   [ios] the number of notice showing on ios app
 *  @param from:    [ios] I have no idea yet
 *  @param sound:   [ios] the sound to use when app recieved push
 *
 */
app.post('/push', function(req, res) {

	// Post header must be json
	if (req.headers['content-type'] !== 'application/json') {
		winston.log('error', 'Header format is not json.');
		res.json(404, {
			Success: false,
			error: 'Header format is not json.'
		});
		res.end();
		return;
	}

	//Get json header object
	var opt = req.body;
	// var target = opt.target;

	if (!opt.target) {
		res.json(404, {
			success: false,
			error: 'target can not be empty'
		});
		return;
	}

	if (!opt.message) {
		res.json(404, {
			success: false,
			error: 'message can not be empty'
		});
		return;
	}

	if (opt.message.length > 68) {
		res.json(404, {
			success: false,
			error: 'message length exceeded 68 characters'
		});
		return;
	}

	if (!opt.tokens) {
		res.json(404, {
			success: false,
			error: 'you need at least one token to push message'
		});
		return;
	}

	var target = config.targets[opt.target];
	var targetConnection = connections[opt.target];

	if (!target) {
		res.json(404, {
			success: false,
			error: 'target is not a proper setup to push'
		});
		return;
	}

	switch (target.type) {
		case 'apns':
			response = pushByAPNS(targetConnection, opt);
			break;

		case 'gcm':
			response = pushByGCM(targetConnection, opt);
			break;

		default:
			res.json(404, {
				success: false,
				error: 'target is not a proper setup to push'
			});
			return;
	}

	res.json(200, {
		success: true
	});

});

process.on('SIGTERM', function() {
	console.log('Closing TK Mailer Service');
	//smtpTransport.close();        // shut down the connection pool, no more messages
	app.close();
});

app.listen(3002);

console.log('TK Mailer Service is listening on port ' + 3002);
winston.log('info', 'TK Mailer Service is listening on port ' + 3002);