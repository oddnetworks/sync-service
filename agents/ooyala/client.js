'use strict';

var _ = require('lodash');
var OoyalaApi = require('node-ooyala-api-client');
var Promise = require('bluebird');
var transform = require('./transform');

// Private Action: Not exposed through Seneca
var decorateVideoWithStreams = function (options, video, client) {
	return client
		.get(['assets', video.meta.sourceId, 'streams'].join('/'))
		.then(function (streams) {
			video.streams = _.map(streams, function (stream) {
				var transformedStream = {};

				_.each(stream, function (value, key) {
					// attempt to convert certain values to numbers
					switch (key) {
						case 'audio_bitrate':
						case 'average_video_bitrate':
						case 'video_height':
						case 'file_size':
						case 'video_width':
							try {
								value = parseInt(value, 10);
							} catch (e) {
								// no-op
							}

							break;
						default:
							// no-op
					}

					transformedStream[_.camelCase(key)] = value;
				});

				return _.omit(transformedStream, ['profile', 'isSource']);
			});
			return video;
		});
};

// Private Action: Not exposed through Seneca
var decorateVideosWithStreams = function (options, videos, client) {
	return Promise.map(videos, function (video) {
		return decorateVideoWithStreams(options, video, client);
	}, {concurrency: options.concurrency});
};

// Private Action: Not exposed through Seneca
var decorateWithReleaseDate = function (options, entity, client) {
	return client
		.get(['publishing_rules', entity.meta.publishing_rule_id].join('/'))
		.then(function (publishingRule) {
			var createdAt = new Date(entity.createdAt);
			var startTime = new Date(publishingRule.time_restrictions.start_date);

			if (createdAt > startTime) {
				entity.releaseDate = entity.createdAt;
			} else {
				entity.releaseDate = publishingRule.time_restrictions.start_date;
			}

			delete entity.meta.publishing_rule_id;

			return entity;
		});
};

// Private Action: Not exposed through Seneca
var decorateVideosWithReleaseDates = function (options, videos, client) {
	return Promise.map(videos, function (video) {
		return decorateWithReleaseDate(options, video, client);
	}, {concurrency: options.concurrency});
};

function decorateCollectionWithRelationships(options, collection, client, relationTypes) {
	var entityType;
	var relationType;

	if (collection.meta.sourceType === 'channel') {
		entityType = 'video';
		relationType = _.get(relationTypes, 'videos') || 'entities';
	} else if (collection.meta.sourceType === 'channel_set') {
		entityType = _.get(relationTypes, 'collections');
		if (entityType) {
			entityType = entityType.substring(0, entityType.length - 1);
		} else {
			entityType = 'collection';
		}
		relationType = _.get(relationTypes, 'collections') || 'entities';
	} else {
		throw new Error('entity for id ' + collection.meta.id + ' is not a channel or channel set.');
	}

	collection.relationships[relationType] = {
		links: {
			self: '/v1/' + (_.get(relationTypes, 'collections') || 'collections') + '/' + collection.id + '/' + relationType
		},
		data: []
	};
	return client.get(['assets', collection.meta.sourceId, 'lineup'].join('/'))
		.then(function attachRelatedData(embedCodes) {
			_.each(embedCodes, function attachEachRelatedData(dataId) {
				collection.relationships[relationType].data.push({id: 'ooyala-' + dataId, type: entityType});
				return collection;
			});
			return collection;
		});
}

function OoyalaClient(key, secret) {
	this.instance = new OoyalaApi(key, secret);

	this.options = {
		concurrency: 10,
		params: {
			video: {
				include: 'metadata,labels',
				where: 'asset_type=\'video\''
			},
			collection: {
				include: 'metadata,labels',
				where: 'asset_type=\'channel\' OR asset_type=\'channel_set\''
			}
		}
	};

	return this;
}
exports.OoyalaClient = OoyalaClient;

function cleanup(collection) {
	delete collection.meta;
	return collection;
}

OoyalaClient.prototype = {
	fetchVideo: function (id) {
		var client = this.instance;
		var options = this.options;

		return client
			.get(['assets', id].join('/'), this.options.params.video)
			.then(transform.video)
			.then(function (video) {
				return decorateVideoWithStreams(options, video, client);
			})
			.then(function (video) {
				return decorateWithReleaseDate(options, video, client);
			});
	},

	fetchVideos: function () {
		var client = this.instance;
		var options = this.options;

		return client
			.get('assets', this.options.params.video)
			.then(transform.videos)
			.then(function (videos) {
				return decorateVideosWithStreams(options, videos, client);
			})
			.then(function (videos) {
				return decorateVideosWithReleaseDates(options, videos, client);
			});
	},

	fetchCollection: function (id) {
		var client = this.instance;
		var options = this.options;

		return client
			.get(['assets', id].join('/'), options.params.collection)
			.then(function control(data) {
				var collection = transform.channelToCollection(data);
				return decorateCollectionWithRelationships(options, collection, client);
			})
			.then(function decorateVideoWithReleaseDateWrapper(collection) {
				return decorateWithReleaseDate(options, collection, client);
			})
			.then(cleanup);
	},

	fetchCollections: function fetchCollections() {
		var client = this.instance;
		var options = this.options;

		return client
			.get('assets', options.params.collection)
			.then(function getItems(data) {
				return data.items;
			})
			.then(function (channels) {
				return transform.channelsToCollections(channels);
			})
			.then(function decorateCollectionsWithRelationships(collections) {
				return Promise.map(collections, function decorateCollectionsWithRelationshipsEach(collection) {
					return decorateCollectionWithRelationships(options, collection, client);
				});
			})
			.then(function decorateCollectionsWithReleaseDates(collections) {
				return Promise.map(collections, function decorateCollectionsWithReleaseDatesEach(collection) {
					return decorateWithReleaseDate(options, collection, client);
				});
			})
			.then(function cleanupAll(collections) {
				return _.each(collections, cleanup);
			});
	}
};

exports.createClient = function (key, secret) {
	var client = new OoyalaClient(key, secret);

	return client;
};
