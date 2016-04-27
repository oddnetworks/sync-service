'use strict';

var nock = require('nock');
var test = require('tape');
var fs = require('fs');
var path = require('path');
var agent = require('../../agents/ooyala');
var events = require('../events_helper');

var mockAssets = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/videos.json')));
mockAssets.items = mockAssets.items.concat(require('./fixtures/channels.json'));
var mockStreams = require('./fixtures/streams.json');
var mockPublishingRule = require('./fixtures/publishing_rule.json');
var mockChannel02Lineup = require('./fixtures/channel02-lineup.json');
var mockChannelSet01Lineup = require('./fixtures/channel-set01-lineup.json');

var mockFilteredVideos = require('./fixtures/videos-filtered.json');
var mockFilteredChannels = require('./fixtures/channels-filtered.json');
var mockFilteredAssets = {
	items: mockFilteredVideos.items.concat(mockFilteredChannels)
};

test('An Ooyala agent can fetch videos for an organization', function (t) {
	t.plan(1);

	nock('https://api.ooyala.com').get('/v2/publishing_rules/22222').times(4).query(true).reply(200, mockPublishingRule);
	nock('https://api.ooyala.com').get('/v2/assets').twice().query(true).reply(200, mockAssets);
	nock('https://api.ooyala.com').get('/v2/deleted_assets').twice().query(true).reply(200, mockAssets);
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

	nock('https://api.ooyala.com').get('/v2/publishing_rules/22222').times(2).query(true).reply(200, mockPublishingRule);
	nock('https://api.ooyala.com')
		.filteringPath(/expires=[^&]*&signature=[^&]*/g, 'expires=XXX&signature=YYY')
		.get('/v2/assets?include=metadata%2Clabels&where=asset_type%3D\'video\'%20AND%20labels%20INCLUDES%20\'Published\'&api_key=KEY&expires=XXX&signature=YYY')
		.reply(200, mockFilteredAssets);
	nock('https://api.ooyala.com')
		.filteringPath(/expires=[^&]*&signature=[^&]*/g, 'expires=XXX&signature=YYY')
		.get('/v2/assets?include=metadata%2Clabels&where=asset_type%3D\'channel\'%20OR%20asset_type%3D\'channel_set\'%20AND%20labels%20INCLUDES%20\'Published\'&api_key=KEY&expires=XXX&signature=YYY')
		.reply(200, mockFilteredAssets);
	nock('https://api.ooyala.com').get('/v2/deleted_assets').twice().query(true).reply(200, {items: []});
	nock('https://api.ooyala.com').get('/v2/assets/00000/streams').query(true).reply(200, mockStreams);
	nock('https://api.ooyala.com').get('/v2/assets/02/lineup').query(true).reply(200, mockChannel02Lineup);

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
