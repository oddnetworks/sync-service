'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var request = require('request-promise');
var FeedParser = require('feedparser');
var StringStream = require('string-stream');

var transform = require('./transform');

module.exports = function (job, events) {
	var stats = {
		id: job.organization,
		agent: job.agent,
		count: 0
	};

	return request({
		method: 'GET',
		url: job.feedUrl
	})
	.then(function (feed) {
		return new Promise(function (resolve, reject) {
			var feedParser = new FeedParser();
			var stream = new StringStream(feed);
			var site = {};
			var items = [];

			stream.pipe(feedParser);
			feedParser.on('error', function (err) {
				return reject(err);
			});
			feedParser.on('readable', function () {
				var item;
				var results = [];
				if (_.isEmpty(site) && this.meta) {
					site = this.meta;
				}
				while (item = this.read()) { // eslint-disable-line
					results.push(items.push(item));
				}
				return results;
			});
			feedParser.on('end', function () {
				resolve({site: site, items: items});
			});
		});
	})
	.then(function (parsedFeed) {
		var collection = transform.siteToCollection(parsedFeed, job);
		collection.organization = job.organization;
		events.broadcast({role: 'store', cmd: 'sync', sub: 'upsert'}, {merge: 'patch', organization: job.organization, entity: collection});
		stats.count++;

		_.each(parsedFeed.items, function (item) {
			var article = transform.itemToEntity(item);
			article.organization = job.organization;
			events.broadcast({role: 'store', cmd: 'sync', sub: 'upsert'}, {organization: job.organization, entity: article});
			stats.count++;
		});

		return stats;
	});
};
