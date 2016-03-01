'use strict';

var mongodb = require('mongodb').MongoClient;
var config = require('./config');
var oddcast = require('oddcast');
var _ = require('lodash');
var opbeat = require('opbeat');
var Promise = require('bluebird');
var agents = require('./agents');

opbeat.start(config.opbeat);

// Configure OddCast
var events = oddcast.eventChannel();
var transport = oddcast.inprocessTransport();
if (config.env === 'staging' || config.env === 'production') {
	transport = require('oddcast-aws-transport').sqsCommandEmitter(config.oddcast.transport);
}
events.use({role: 'store'}, transport);

mongodb.connect(config.mongodb.uri, function (err, db) {
	if (err) {
		return done(err);
	}

	var syncJobs = db.collection('sync_jobs');

	syncJobs.find({active: true}).toArray(function (err, jobs) {
		if (err) {
			return done(err);
		}

		// Build the promises of jobs to perform
		var promises = _.compact(_.map(jobs, function (job) {
			if (agents[job.agent]) {
				return agents[job.agent](job, events);
			}
		}));

		// Run them all with reflection so they all resolve, but if any fail it doesn't hault the other jobs
		Promise.all(
			promises.map(function (promise) {
				return promise.reflect();
			}))
			.each(function (promise) {
				if (promise.isFulfilled()) {
					console.log(promise.value());
				} else {
					console.error(promise.reason());
					opbeat.captureError(promise.reason());
				}
			})
			.finally(function () {
				db.close(function () {
					done();
				});
			});
	});
});

function done(err) {
	if (err) {
		console.error(err);
		if (config.env === 'production' || config.env === 'staging') {
			opbeat.captureError(err);
		}
		process.exit(err);
	} else {
		process.exit();
	}
}
