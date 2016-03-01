'use strict';

var test = require('tape');
var nock = require('nock');
var path = require('path');
var agent = require('../../agents/itunes');
var events = require('../events_helper');

test('An MRSS agent can sync to the catalog', function (t) {
	t.plan(1);

	nock('https://www.nasa.gov')
		.get('/rss/dyn/NASAcast_vodcast.rss')
		.replyWithFile(200, path.join(__dirname, '/fixtures/feed.rss'));

	var syncJob = {
		agent: 'itunes',
		organization: 'beta',
		url: 'https://www.nasa.gov/rss/dyn/NASAcast_vodcast.rss'
	};

	agent(syncJob, events)
		.then(function (results) {
			t.equal(results.count, 11);
		})
		.catch(t.end);
});
