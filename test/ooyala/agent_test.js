'use strict';

var nock = require('nock');
var test = require('tape');
var agent = require('../../agents/ooyala');
var events = require('../events_helper');

var EXPIRATION_AND_SIGNATURE_PATTERN = /expires=[^&]*&signature=[^&]*/g;
var EXPIRATION_AND_SIGNATURE_PARAMS = 'expires=XXX&signature=YYY';
var KEY_EXPIRATION_SIGNATURE_PARAMS = '&api_key=KEY&expires=XXX&signature=YYY';
var EMPTY_ASSETS_RESPONSE = {items: []};

var mockVideoAssets = require('./fixtures/videos.json');
var mockChannelAssets = require('./fixtures/channels.json');
var mockStreams = require('./fixtures/streams.json');
var mockPublishingRule = require('./fixtures/publishing_rule.json');
var mockChannel02Lineup = require('./fixtures/channel02-lineup.json');
var mockChannelSet01Lineup = require('./fixtures/channel-set01-lineup.json');

var mockFilteredVideos = require('./fixtures/videos-filtered.json');
var mockFilteredChannels = require('./fixtures/channels-filtered.json');

test('An Ooyala agent can fetch videos for an organization', function (t) {
	t.plan(1);

	nock('https://api.ooyala.com').get('/v2/publishing_rules/22222').times(4).query(true).reply(200, mockPublishingRule);
	nock('https://api.ooyala.com')
		.filteringPath(EXPIRATION_AND_SIGNATURE_PATTERN, EXPIRATION_AND_SIGNATURE_PARAMS)
		.get('/v2/assets?include=metadata%2Clabels&where=asset_type%3D\'video\'' + KEY_EXPIRATION_SIGNATURE_PARAMS)
		.reply(200, mockVideoAssets);
	nock('https://api.ooyala.com')
		.filteringPath(EXPIRATION_AND_SIGNATURE_PATTERN, EXPIRATION_AND_SIGNATURE_PARAMS)
		.get('/v2/assets?include=metadata%2Clabels&where=asset_type%3D\'channel\'%20OR%20asset_type%3D\'channel_set\'' + KEY_EXPIRATION_SIGNATURE_PARAMS)
		.reply(200, mockChannelAssets);
	nock('https://api.ooyala.com').get('/v2/deleted_assets').twice().query(true).reply(200, EMPTY_ASSETS_RESPONSE);
	nock('https://api.ooyala.com').get('/v2/assets/00000/streams').query(true).reply(200, mockStreams);
	nock('https://api.ooyala.com').get('/v2/assets/11111/streams').query(true).reply(200, mockStreams);
	nock('https://api.ooyala.com').get('/v2/assets/02/lineup').query(true).reply(200, mockChannel02Lineup);
	nock('https://api.ooyala.com').get('/v2/assets/channel_set1/lineup').query(true).reply(200, mockChannelSet01Lineup);

	var syncJob = {
		organization: 'odd-networks',
		agent: 'ooyala',
		key: 'KEY',
		secret: 'SECRET',
		active: true
	};

	agent(syncJob, events)
		.then(function (results) {
			t.equal(results.count, 4);
		})
		.catch(t.end);
});

test('An Ooyala agent can fetch videos for an organization filtered by labels', function (t) {
	t.plan(1);

	nock('https://api.ooyala.com')
		.get('/v2/publishing_rules/22222')
		.times(2)
		.query(true)
		.reply(200, mockPublishingRule);
	nock('https://api.ooyala.com')
		.filteringPath(EXPIRATION_AND_SIGNATURE_PATTERN, EXPIRATION_AND_SIGNATURE_PARAMS)
		.get('/v2/assets?include=metadata%2Clabels&where=asset_type%3D\'channel\'%20OR%20asset_type%3D\'channel_set\'%20AND%20labels%20INCLUDES%20\'Published\'' + KEY_EXPIRATION_SIGNATURE_PARAMS)
		.reply(200, mockFilteredChannels);
	nock('https://api.ooyala.com')
		.filteringPath(EXPIRATION_AND_SIGNATURE_PATTERN, EXPIRATION_AND_SIGNATURE_PARAMS)
		.get('/v2/assets?include=metadata%2Clabels&where=asset_type%3D\'video\'%20AND%20labels%20INCLUDES%20\'Published\'' + KEY_EXPIRATION_SIGNATURE_PARAMS)
		.reply(200, mockFilteredVideos);
	nock('https://api.ooyala.com')
		.get('/v2/deleted_assets')
		.twice()
		.query(true)
		.reply(200, EMPTY_ASSETS_RESPONSE);
	nock('https://api.ooyala.com')
		.get('/v2/assets/00000/streams')
		.query(true)
		.reply(200, mockStreams);
	nock('https://api.ooyala.com')
		.get('/v2/assets/02/lineup')
		.query(true)
		.reply(200, mockChannel02Lineup);

	var syncJob = {
		organization: 'odd-networks',
		agent: 'ooyala',
		key: 'KEY',
		secret: 'SECRET',
		active: true,
		labels: ['Published']
	};

	agent(syncJob, events)
		.then(function (results) {
			t.equal(results.count, 2);
		})
		.catch(t.end);
});
