'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var BrightcoveApiClient = require('./client.js');

var transform = require('./transform');

module.exports = function (job, events) {
	var client = new BrightcoveApiClient(job.accountId, job.clientId, job.clientSecret);
	var syncJobId = [job.agent, job.organization, Date.now()].join(':');
	var stats = {
		id: job.organization,
		agent: job.agent,
		count: 0
	};

	events.broadcast({role: 'store', cmd: 'sync', sub: 'startSession'}, {organization: job.organization, syncJobId: syncJobId});

	return Promise.join(
		client.fetchCollections().then(function (results) {
			_.each(results, function (playlist) {
				var collection = transform.playlistToCollection(playlist);
				events.broadcast({role: 'store', cmd: 'sync', sub: 'upsert'}, {organization: job.organization, entity: collection});
				stats.count++;
			});
		}),

		client.fetchVideos().then(function (videos) {
			return Promise.all(_.map(videos, function (video) {
				return client.fetchVideoSources(video.id).then(function (sources) {
					video = transform.brightcoveToVideo(video);
					video.streams = sources;
					events.broadcast({role: 'store', cmd: 'sync', sub: 'upsert'}, {organization: job.organization, entity: video});
					stats.count++;
				});
			}));
		})
	).then(function () {
		events.broadcast({role: 'store', cmd: 'sync', sub: 'endSession'}, {organization: job.organization, syncJobId: syncJobId});

		return stats;
	});
};
