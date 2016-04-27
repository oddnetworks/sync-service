'use strict';

var _ = require('lodash');
var Promise = require('bluebird');

module.exports = function (job, events) {
	var client = require('./client').createClient(job.key, job.secret);
	var syncJobId = [job.agent, job.organization, Date.now()].join(':');
	var stats = {
		id: job.organization,
		agent: job.agent,
		count: 0
	};

	return Promise.join(
			client.fetchCollections(job.labels),
			client.fetchVideos(job.labels)
		)

		// Once all 4 complete we have arrays for each
		.then(function (results) {
			var ooyalaCollections = results[0];
			var ooyalaVideos = results[1];

			events.broadcast({role: 'store', cmd: 'sync', sub: 'startSession'}, {organization: job.organization, syncJobId: syncJobId});

			_.each(ooyalaVideos, function (video) {
				video.organization = job.organization;
				events.broadcast({role: 'store', cmd: 'sync', sub: 'upsert'}, {organization: job.organization, entity: video});
				stats.count++;
			});

			_.each(ooyalaCollections, function (collection) {
				collection.organization = job.organization;
				events.broadcast({role: 'store', cmd: 'sync', sub: 'upsert'}, {organization: job.organization, entity: collection});
				stats.count++;
			});

			events.broadcast({role: 'store', cmd: 'sync', sub: 'endSession'}, {organization: job.organization, syncJobId: syncJobId});

			return stats;
		});
};
