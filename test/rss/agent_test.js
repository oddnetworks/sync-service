'use strict';

var test = require('tape');
var nock = require('nock');
var path = require('path');
var agent = require('../../agents/rss');
var events = require('../events_helper');

test('An RSS agent can fetch articles from an rssFeed', function (t) {
	t.plan(1);

	nock('http://example.com/en/bfts').get('/articles.rss').replyWithFile(200, path.join(__dirname, 'fixtures/articles.rss'));

	var syncJob = {
		agent: 'rss',
		organization: 'odd-networks',
		feedUrl: 'http://example.com/en/bfts/articles.rss'
	};

	agent(syncJob, events)
		.then(function (results) {
			t.equal(results.count, 2);
		})
		.catch(t.end);
});

test('An RSS agent can fetch events from an rssFeed', function (t) {
	t.plan(1);

	nock('http://example.com/en/bfts').get('/events.rss').replyWithFile(200, path.join(__dirname, 'fixtures/events.rss'));

	var syncJob = {
		agent: 'rss',
		organization: 'odd-networks',
		feedUrl: 'http://example.com/en/bfts/events.rss'
	};

	agent(syncJob, events)
		.then(function (results) {
			t.equal(results.count, 2);
		})
		.catch(t.end);
});
