'use strict';

// Nuke any existing log files
var nock = require('nock');
var _ = require('lodash');
var test = require('tape');
var client = require('../../agents/ooyala/client').createClient('FvN2MyOuliJLHzwr1ueZWo8eJ0yA.WXaKW', 'CB3ncl0X7u2mSn8WAGSA0vtaSB9qyQjRwKsMEBW0');

var mockVideos = require('./fixtures/videos.json');
var mockVideo = require('./fixtures/video.json');
var mockStreams = require('./fixtures/streams.json');
var mockPublishingRule = require('./fixtures/publishing_rule.json');

test('An ooyala plugin can fetch a video and decorate it with source, sourceId, images, and streams', function (t) {
	t.plan(12);

	nock('https://api.ooyala.com').get('/v2/assets/00000').query(true).reply(200, mockVideo);
	nock('https://api.ooyala.com').get('/v2/assets/00000/streams').query(true).reply(200, mockStreams);
	nock('https://api.ooyala.com').get('/v2/publishing_rules/' + mockVideo.publishing_rule_id).query(true).reply(200, mockPublishingRule);

	client
		.fetchVideo('00000')
		.then(function (out) {
			t.equal(out.type, 'video', 'returns a video');
			t.equal(out.meta.sourceId, '00000', 'video contains meta.sourceId');
			t.equal(out.id, 'ooyala-00000', 'video contains id');
			t.equal(out.images.aspect4x3, 'http://image.oddworks.io/edummyimage/4:3x1440&text=placeholder.png', 'video contains odd-flavored attributes.images placeholders');
			t.ok(out.images.aspect16x9.search('http://image.oddnetworks.io/eooyala/'), 'video contains odd-flavored attributes.images.aspect16x9');
			t.equal(out.meta.source, 'ooyala', 'video contains meta.source');
			t.ok(Array.isArray(out.streams), 'video contains array of attributes.streams');
			t.equal(out.releaseDate, out.createdAt, 'video contains valid releaseDate when createdAt > publishing_rule.time_restrictions.start_date');
			t.equal(out.actors[0], 'Bill Murray', 'video has proper actor names');
			t.equal(out.actors.length, 1, 'video has proper number of actors assigned');
			t.equal(out.tags.length, 2, 'video has proper number of tags assigned');
			t.equal(out.tags[0], 'LABEL2', 'video has proper tags names');
		})
		.catch(t.end);
});

test('An ooyala plugin can fetch videos and decorate them with source, sourceId, images, and streams', function (t) {
	t.plan(16);

	nock('https://api.ooyala.com').get('/v2/publishing_rules/22222').twice().query(true).reply(200, mockPublishingRule);
	nock('https://api.ooyala.com').get('/v2/assets').query(true).reply(200, mockVideos);
	nock('https://api.ooyala.com').get('/v2/assets/00000/streams').query(true).reply(200, mockStreams);
	nock('https://api.ooyala.com').get('/v2/assets/11111/streams').query(true).reply(200, mockStreams);

	client
		.fetchVideos()
		.then(function (out) {
			t.ok(Array.isArray(out), 'returns an array');
			t.equal(out.length, 2, 'array contains 2 videos');
			t.equal(out[0].type, 'video', 'entity type is video');
			t.equal(out[0].images.aspect4x3, 'http://image.oddworks.io/edummyimage/4:3x1440&text=placeholder.png', 'video contains odd-flavored attributes.images placeholders');
			t.ok(out[0].images.aspect16x9.search('http://image.oddnetworks.io/eooyala/'), 'video contains odd-flavored attributes.images.aspect16x9');
			t.ok(Array.isArray(out[0].streams), 'video contains an array of streams');
			t.ok(_.isString(out[0].meta.sourceId), true, 'video contains meta.sourceId');
			t.equal(out[0].meta.source, 'ooyala', 'video contains meta.source');
			t.equal(out[0].releaseDate, out[0].createdAt, 'video contains valid releaseDate when createdAt > publishing_rule.time_restrictions.start_date');
			t.equal(out[1].releaseDate, mockPublishingRule.time_restrictions.start_date, 'video contains valid releaseDate when createdAt < publishing_rule.time_restrictions.start_date');
			t.equal(out[0].actors.length, 0, 'video has proper number of actors assigned');
			t.equal(out[1].actors[0], 'Bill Murray', 'video has proper actor names');
			t.equal(out[1].actors.length, 3, 'video has proper number of actors assigned');
			t.equal(out[0].tags.length, 0, 'video without tags has proper number of tags assigned');
			t.equal(out[1].tags.length, 2, 'video with tags has proper number of tags assigned');
			t.equal(out[1].tags[0], 'LABEL2', 'video with tags has proper tag names');
		})
		.catch(t.end);
});
