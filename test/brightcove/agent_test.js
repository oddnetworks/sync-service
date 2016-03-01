'use strict';

// var url = require('url');
var test = require('tape');
var nock = require('nock');
var path = require('path');
var agent = require('../../agents/brightcove');
var events = require('../events_helper');

var accountId = 1752604059001;
// var clientId = 'facb9c4b-4e8d-4aaa-81c3-e05c6a1de1fe';
// var clientSecret = 'OAFrZR91_STSgaCrduxBub021fNK9jZisHs7WN_25NXztgQNnIOjTcI4IIZ6lQVysqztuk8cneB6IzfEvIz3_g';
var clientId = 'foo';
var clientSecret = 'bar';

test('A Brightcove agent can sync to the catalog', function (t) {
	t.plan(1);

	mockAuth();
	mockBrightcoveCalls();
	mockVideoCall('4492075574001');

	var syncJob = {
		accountId: accountId,
		agent: 'brightcove',
		orgnaization: 'brightcoveClient',
		clientId: clientId,
		clientSecret: clientSecret
	};

	agent(syncJob, events)
		.then(function (results) {
			t.equal(results.count, 3);
		})
		.catch(t.end);
});

function mockAuth() {
	nock('https://oauth.brightcove.com/v3')
		.post('/access_token')
		.times(3)
		.query({grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret}) // eslint-disable-line
		.reply(200, {access_token : 'access_token'}); // eslint-disable-line
}

function mockBrightcoveCalls() {
	// Mock the videos call
	nock('https://cms.api.brightcove.com/v1/accounts/' + accountId)
		.get('/videos')
		.replyWithFile(200, path.join(__dirname, './fixtures/videos.json'));

	// Mock the collections call
	nock('https://cms.api.brightcove.com/v1/accounts/' + accountId)
		.get('/playlists')
		.replyWithFile(200, path.join(__dirname, './fixtures/playlists.json'));
}

function mockVideoCall(videoId) {
	// Mock the video source call
	nock('https://cms.api.brightcove.com/v1/accounts/' + accountId)
		.get('/videos/' + videoId + '/sources')
		.replyWithFile(200, path.join(__dirname, './fixtures/video_sources.json'));
}
