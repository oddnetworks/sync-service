'use strict';

// Nuke any existing log files
var nock		= require('nock');
var test		= require('tape');
var client = require('../../agents/ooyala/client').createClient('FvN2MyOuliJLHzwr1ueZWo8eJ0yA.WXaKW', 'CB3ncl0X7u2mSn8WAGSA0vtaSB9qyQjRwKsMEBW0');

var mockChannel01 = require('./fixtures/channel01.json');
var mockChannel01lineup = require('./fixtures/channel01lineup.json');
var mockChannelSet01 = require('./fixtures/channel-set01.json');
var mockChannelSet01lineup = require('./fixtures/channel-set01-lineup.json');
var mockPublishingRule	= require('./fixtures/publishing_rule.json');

test('FetchCollection returns a collection of videos when passed the id of a channel', function (t) {
	t.plan(15);

	nock('https://api.ooyala.com')
		.get('/v2/assets/' + mockChannel01.embed_code)
		.query(true)
		.reply(200, mockChannel01);
	nock('https://api.ooyala.com')
		.get('/v2/assets/' + mockChannel01.embed_code + '/lineup')
		.query(true)
		.reply(200, mockChannel01lineup);
	nock('https://api.ooyala.com')
		.get('/v2/publishing_rules/' + mockChannel01.publishing_rule_id)
		.query(true)
		.reply(200, mockPublishingRule);

	client
		.fetchCollection(mockChannel01.embed_code)
		.then(function (collection) {
			t.equal(collection.id, 'ooyala-' + mockChannel01.embed_code);
			t.equal(collection.type, 'collection');
			t.equal(collection.title, mockChannel01.name);
			t.equal(collection.description, mockChannel01.description);
			t.equal(collection.images.aspect16x9, 'http://image.oddworks.io/eooyala/xhdG5nMjoiKNbeAz0UrQo2_YVPcZRng8/Ut_HKthATH4eww8X5hMDoxOmdtO6xlQD.jpg');
			t.equal(collection.releaseDate, mockPublishingRule.time_restrictions.start_date);
			t.equal(collection.updatedAt, mockChannel01.updated_at);
			t.equal(collection.createdAt, mockChannel01.created_at);
			var rel = collection.relationships;
			t.equal(rel.entities.links.self, '/v1/collections/ooyala-' + mockChannel01.embed_code + '/entities');
			t.ok(Array.isArray(rel.entities.data));
			t.equal(rel.entities.data.length, 2);
			t.equal(rel.entities.data[0].id, 'ooyala-' + mockChannel01lineup[0]);
			t.equal(rel.entities.data[0].type, 'video');
			t.equal(rel.entities.data[1].id, 'ooyala-' + mockChannel01lineup[1]);
			t.equal(rel.entities.data[1].type, 'video');
		})
		.catch(t.end);
});

test('FetchCollection returns a collection of channels when passed the id of a channel_set', function (t) {
	nock('https://api.ooyala.com')
		.get('/v2/assets/' + mockChannelSet01.embed_code)
		.query(true)
		.reply(200, mockChannelSet01);
	nock('https://api.ooyala.com')
		.get('/v2/assets/' + mockChannelSet01.embed_code + '/lineup')
		.query(true)
		.reply(200, mockChannelSet01lineup);
	nock('https://api.ooyala.com')
		.get('/v2/publishing_rules/' + mockChannelSet01.publishing_rule_id)
		.query(true)
		.reply(200, mockPublishingRule);
	t.plan(13);

	client
		.fetchCollection(mockChannelSet01.embed_code)
		.then(function (collection) {
			t.equal(collection.id, 'ooyala-' + mockChannelSet01.embed_code);
			t.equal(collection.type, 'collection');
			t.equal(collection.title, mockChannelSet01.name);
			t.equal(collection.description, mockChannelSet01.description);
			t.equal(collection.images.aspect16x9, 'http://image.oddworks.io/eooyala/xhdG5nMjoiKNbeAz0UrQo2_YVPcZRng8/Ut_HKthATH4eww8X5hMDoxOmdtO6xlQD.jpg');
			t.equal(collection.releaseDate, mockPublishingRule.time_restrictions.start_date);
			t.equal(collection.updatedAt, mockChannelSet01.updated_at);
			t.equal(collection.createdAt, mockChannelSet01.created_at);
			var rel = collection.relationships;
			t.equal(rel.entities.links.self, '/v1/collections/ooyala-' + mockChannelSet01.embed_code + '/entities');
			t.ok(Array.isArray(rel.entities.data));
			t.equal(rel.entities.data.length, 1);
			t.equal(rel.entities.data[0].id, 'ooyala-' + mockChannelSet01lineup[0]);
			t.equal(rel.entities.data[0].type, 'collection');
		})
		.catch(t.end);
});

test('FetchCollections a list of video collections', function (t) {
	t.plan(29);

	nock('https://api.ooyala.com')
		.get('/v2/assets')
		.query(true)
		.reply(200, {items: [mockChannel01, mockChannelSet01]});
	nock('https://api.ooyala.com')
		.get('/v2/assets/' + mockChannel01.embed_code + '/lineup')
		.query(true)
		.reply(200, mockChannel01lineup);
	nock('https://api.ooyala.com')
		.get('/v2/assets/' + mockChannelSet01.embed_code + '/lineup')
		.query(true)
		.reply(200, mockChannelSet01lineup);
	nock('https://api.ooyala.com')
		.get('/v2/publishing_rules/' + mockChannelSet01.publishing_rule_id)
		.twice()
		.query(true)
		.reply(200, mockPublishingRule);

	client
		.fetchCollections()
		.then(function (collectionList) {
			t.equal(collectionList.length, 2);
			t.equal(collectionList[0].id, 'ooyala-' + mockChannel01.embed_code);
			t.equal(collectionList[0].type, 'collection');
			t.equal(collectionList[0].title, mockChannel01.name);
			t.equal(collectionList[0].description, mockChannel01.description);
			t.equal(collectionList[0].images.aspect16x9, 'http://image.oddworks.io/eooyala/xhdG5nMjoiKNbeAz0UrQo2_YVPcZRng8/Ut_HKthATH4eww8X5hMDoxOmdtO6xlQD.jpg');
			t.equal(collectionList[0].releaseDate, mockPublishingRule.time_restrictions.start_date);
			t.equal(collectionList[0].updatedAt, mockChannel01.updated_at);
			t.equal(collectionList[0].createdAt, mockChannel01.created_at);
			var rel = collectionList[0].relationships;
			t.equal(rel.entities.links.self, '/v1/collections/ooyala-' + mockChannel01.embed_code + '/entities');
			t.ok(Array.isArray(rel.entities.data));
			t.equal(rel.entities.data.length, 2);
			t.equal(rel.entities.data[0].id, 'ooyala-' + mockChannel01lineup[0]);
			t.equal(rel.entities.data[0].type, 'video');
			t.equal(rel.entities.data[1].id, 'ooyala-' + mockChannel01lineup[1]);
			t.equal(rel.entities.data[1].type, 'video');
			t.equal(collectionList[1].id, 'ooyala-' + mockChannelSet01.embed_code);
			t.equal(collectionList[1].type, 'collection');
			t.equal(collectionList[1].title, mockChannelSet01.name);
			t.equal(collectionList[1].description, mockChannelSet01.description);
			t.equal(collectionList[1].images.aspect16x9, 'http://image.oddworks.io/eooyala/xhdG5nMjoiKNbeAz0UrQo2_YVPcZRng8/Ut_HKthATH4eww8X5hMDoxOmdtO6xlQD.jpg');
			t.equal(collectionList[1].releaseDate, mockPublishingRule.time_restrictions.start_date);
			t.equal(collectionList[1].updatedAt, mockChannelSet01.updated_at);
			t.equal(collectionList[1].createdAt, mockChannelSet01.created_at);
			var rel2 = collectionList[1].relationships;
			t.equal(rel2.entities.links.self, '/v1/collections/ooyala-' + mockChannelSet01.embed_code + '/entities');
			t.ok(Array.isArray(rel2.entities.data));
			t.equal(rel2.entities.data.length, 1);
			t.equal(rel2.entities.data[0].id, 'ooyala-' + mockChannelSet01lineup[0]);
			t.equal(rel2.entities.data[0].type, 'collection');
		})
		.catch(t.end);
});

test('FetchCollections a list of video collections defaults to entities', function (t) {
	t.plan(29);

	nock('https://api.ooyala.com')
		.get('/v2/assets')
		.query(true)
		.reply(200, {items: [mockChannel01, mockChannelSet01]});
	nock('https://api.ooyala.com')
		.get('/v2/assets/' + mockChannel01.embed_code + '/lineup')
		.query(true)
		.reply(200, mockChannel01lineup);
	nock('https://api.ooyala.com')
		.get('/v2/assets/' + mockChannelSet01.embed_code + '/lineup')
		.query(true)
		.reply(200, mockChannelSet01lineup);
	nock('https://api.ooyala.com')
		.get('/v2/publishing_rules/' + mockChannelSet01.publishing_rule_id)
		.twice()
		.query(true)
		.reply(200, mockPublishingRule);

	client
		.fetchCollections()
		.then(function (collectionList) {
			t.equal(collectionList.length, 2);
			t.equal(collectionList[0].id, 'ooyala-' + mockChannel01.embed_code);
			t.equal(collectionList[0].type, 'collection');
			t.equal(collectionList[0].title, mockChannel01.name);
			t.equal(collectionList[0].description, mockChannel01.description);
			t.equal(collectionList[0].images.aspect16x9, 'http://image.oddworks.io/eooyala/xhdG5nMjoiKNbeAz0UrQo2_YVPcZRng8/Ut_HKthATH4eww8X5hMDoxOmdtO6xlQD.jpg');
			t.equal(collectionList[0].releaseDate, mockPublishingRule.time_restrictions.start_date);
			t.equal(collectionList[0].updatedAt, mockChannel01.updated_at);
			t.equal(collectionList[0].createdAt, mockChannel01.created_at);
			var rel = collectionList[0].relationships;
			t.equal(rel.entities.links.self, '/v1/collections/ooyala-' + mockChannel01.embed_code + '/entities');
			t.ok(Array.isArray(rel.entities.data));
			t.equal(rel.entities.data.length, 2);
			t.equal(rel.entities.data[0].id, 'ooyala-' + mockChannel01lineup[0]);
			t.equal(rel.entities.data[0].type, 'video');
			t.equal(rel.entities.data[1].id, 'ooyala-' + mockChannel01lineup[1]);
			t.equal(rel.entities.data[1].type, 'video');
			t.equal(collectionList[1].id, 'ooyala-' + mockChannelSet01.embed_code);
			t.equal(collectionList[1].type, 'collection');
			t.equal(collectionList[1].title, mockChannelSet01.name);
			t.equal(collectionList[1].description, mockChannelSet01.description);
			t.equal(collectionList[1].images.aspect16x9, 'http://image.oddworks.io/eooyala/xhdG5nMjoiKNbeAz0UrQo2_YVPcZRng8/Ut_HKthATH4eww8X5hMDoxOmdtO6xlQD.jpg');
			t.equal(collectionList[1].releaseDate, mockPublishingRule.time_restrictions.start_date);
			t.equal(collectionList[1].updatedAt, mockChannelSet01.updated_at);
			t.equal(collectionList[1].createdAt, mockChannelSet01.created_at);
			var rel2 = collectionList[1].relationships;
			t.equal(rel2.entities.links.self, '/v1/collections/ooyala-' + mockChannelSet01.embed_code + '/entities');
			t.ok(Array.isArray(rel2.entities.data));
			t.equal(rel2.entities.data.length, 1);
			t.equal(rel2.entities.data[0].id, 'ooyala-' + mockChannelSet01lineup[0]);
			t.equal(rel2.entities.data[0].type, 'collection');
		})
		.catch(t.end);
});
