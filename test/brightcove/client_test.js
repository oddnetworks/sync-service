'use strict';

var test = require('tape');
var BrightcoveApiClient = require('../../agents/brightcove/client.js');
var nock = require('nock');
var path = require('path');
var client;

var accountId = 4667028124001;

test('A BrightCoveApiClient agent can fetch videos for an organization', function (t) {
	t.plan(1);

	setupClientandMockAuth();

	// Mock the video call
	nock('https://cms.api.brightcove.com/v1/accounts/' + accountId)
		.get('/videos')
		.replyWithFile(200, path.join(__dirname, './fixtures/videos.json'));

	client.fetchVideos().then(function (res) {
		res = res;
		t.equal(res[0].id, '4492075574001', 'it populates the video id');
	});
});

test('A BrightcoveApiClient can fetch collections for an organization', function (t) {
	t.plan(2);
	setupClientandMockAuth();

	nock('https://cms.api.brightcove.com/v1/accounts/' + accountId)
		.get('/playlists')
		.replyWithFile(200, path.join(__dirname, './fixtures/playlists.json'));

	client.fetchCollections().then(function (collections) {
		t.equal(collections.length, 2, 'it gets the account collections');
		t.equal(collections[0].video_ids.length, 7);
		t.end();
	});
});

test('A BrightcoveApiClient can fetch the hightest quality video source for a video', function (t) {
	t.plan(1);
	setupClientandMockAuth();
	var videoId = '4454723119001';
	var expectedUrl = 'https://brightcove.hs.llnwd.net/e1/uds/pd/96980657001/96980657001_207397050001_Bird-Titmouse-iStock-000005422648HD1080.mp4?pubId=4667028124001&videoId=4667359403001';

	// Mock the video source call
	nock('https://cms.api.brightcove.com/v1/accounts/' + accountId)
		.get('/videos/' + videoId + '/sources')
		.replyWithFile(200, path.join(__dirname, './fixtures/video_sources.json'));

	client.fetchHighestQualityVideoSourceUrl(videoId).then(function (srcUrl) {
		t.equal(srcUrl, expectedUrl, 'it gets the expected url');
		t.end();
	});
});

function setupClientandMockAuth() {
	// var clientId = 'facb9c4b-4e8d-4aaa-81c3-e05c6a1de1fe';
	// var clientSecret = 'OAFrZR91_STSgaCrduxBub021fNK9jZisHs7WN_25NXztgQNnIOjTcI4IIZ6lQVysqztuk8cneB6IzfEvIz3_g';
	var clientId = 'foo';
	var clientSecret = 'bar';
	client = new BrightcoveApiClient(accountId, clientId, clientSecret);

	nock('https://oauth.brightcove.com/v3')
		.post('/access_token')
		.query({grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret}) // eslint-disable-line
		.reply(200, {access_token : 'access_token'}); // eslint-disable-line
}
