'use strict';

var _ = require('lodash');
var URI = require('urijs');
var transform = require('jsonpath-object-transform');
var videoTemplates = require('./templates/video');
var collectionTemplates = require('./templates/collection');

function video(data) {
	var result;
	var uri;

	result = data;

	if (result.asset_type !== 'video') {
		return null;
	}

	result = transform(data, videoTemplates.video);

	if (result.images.aspect16x9) {
		uri = new URI(result.images.aspect16x9);
		result.images.aspect16x9 = 'http://image.oddworks.io/eooyala' + uri.path() + '.jpg';
	}

	if (!result.description) {
		result.description = '';
	}

	result = _.defaultsDeep(result, {meta: {source: 'ooyala'}});
	result = _.defaultsDeep(result, {images: {
		aspect16x9: 'http://image.oddworks.io/edummyimage/16:9x1920&text=placeholder.png',
		aspect4x3: 'http://image.oddworks.io/edummyimage/4:3x1440&text=placeholder.png',
		aspect3x4: 'http://image.oddworks.io/edummyimage/3:4x1920&text=placeholder.png',
		aspect1x1: 'http://image.oddworks.io/edummyimage/1:1x1920&text=placeholder.png',
		aspect2x3: 'http://image.oddworks.io/edummyimage/2:3x1920&text=placeholder.png'
	}});

	result.id = 'ooyala-' + result.id;

	return result;
}

function videos(data) {
	var results;

	/* eslint-disable camelcase */
	results = _.filter(data.items, {asset_type: 'video'});
	/* eslint-enable camelcase */

	if (results.length === 0) {
		return results;
	}

	results = transform({items: results}, videoTemplates);
	results = _(results.videos).map(function (item) {
		var uri;

		if (item.images.aspect16x9) {
			uri = new URI(item.images.aspect16x9);
			item.images.aspect16x9 = 'http://image.oddworks.io/eooyala' + uri.path() + '.jpg';
		}

		if (!item.description) {
			item.description = '';
		}

		item.id = 'ooyala-' + item.id;
		item = _.defaultsDeep(item, {meta: {source: 'ooyala'}});

		item = _.defaultsDeep(item, {images: {
			aspect16x9: 'http://image.oddworks.io/edummyimage/16:9x1920&text=placeholder.png',
			aspect4x3: 'http://image.oddworks.io/edummyimage/4:3x1440&text=placeholder.png',
			aspect3x4: 'http://image.oddworks.io/edummyimage/3:4x1920&text=placeholder.png',
			aspect1x1: 'http://image.oddworks.io/edummyimage/1:1x1920&text=placeholder.png',
			aspect2x3: 'http://image.oddworks.io/edummyimage/2:3x1920&text=placeholder.png'
		}});

		return item;
	}).value();

	return results;
}

function channelToCollection(channel, relationTypes) {
	if (!_.contains(['channel', 'channel_set'], channel.asset_type)) {
		return null;
	}

	var collection = transform(channel, collectionTemplates.channelToCollection);

	var uri;
	if (collection.images.aspect16x9 && collection.images.aspect16x9 !== null) {
		uri = new URI(collection.images.aspect16x9);
		collection.images.aspect16x9 = 'http://image.oddworks.io/eooyala' + uri.path() + '.jpg';
	} else {
		collection.images.aspect16x9 = 'http://image.oddworks.io/edummyimage/16:9x1920&text=placeholder.png';
	}
	var type = _.get(relationTypes, 'collections');
	if (type) {
		type = type.substring(0, type.length - 1);
	} else {
		type = 'collection';
	}

	collection = _.defaultsDeep(collection, {
		type: type,
		images: {
			aspect16x9: 'http://image.oddworks.io/edummyimage/16:9x1920&text=placeholder.png'
		},
		meta: {
			source: 'ooyala'
		}
	});
	collection.id = 'ooyala-' + collection.id;
	return collection;
}

function channelsToCollections(channels, relationTypes) {
	var collections = _.map(channels, function (channel) {
		return channelToCollection(channel, relationTypes);
	});
	_.remove(collections, function (x) {
		return x === null;
	});
	return collections;
}

function deletedToEntities(data) {
	var transformed;

	return _.map(data.items, function (entity) {
		if (entity.asset_type === 'video') {
			transformed = video(entity);
		} else {
			transformed = channelToCollection(entity);
		}

		return transformed;
	});
}

module.exports = {
	videos: videos,
	video: video,
	channelToCollection: channelToCollection,
	channelsToCollections: channelsToCollections,
	deletedToEntities: deletedToEntities
};
