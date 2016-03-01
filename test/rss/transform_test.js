var test = require('tape');
var transform = require('../../agents/rss/transform');
var articlesFeed = require('./fixtures/articles.json');
var eventsFeed = require('./fixtures/events.json');

test('RSS: Transform Articles', function (t) {
	t.plan(6);

	var syncJob = {
		agent: 'rss',
		organization: 'odd-networks',
		feedUrl: 'http://example.com/en/bfts/articles.rss'
	};

	var collection = transform.siteToCollection(articlesFeed, syncJob);
	t.equal(collection.type, 'collection', 'sets correct type for site');
	t.equal(collection.title, 'RSS Schedule');
	t.equal(collection.relationships.entities.data.length, 1, 'has a releated event');
	var relatedEvent = collection.relationships.entities.data[0];
	t.equal(relatedEvent.type, 'article', 'related event has the right type');

	var article = transform.itemToEntity(articlesFeed.items[0]);
	t.equal(article.title, 'Chicago Invitational', 'sets article title');
	t.equal(article.description, 'Allstate Arena', 'sets article description');

	t.end();
});

test('RSS: Transform Events', function (t) {
	t.plan(7);

	var syncJob = {
		agent: 'rss',
		organization: 'odd-networks',
		feedUrl: 'http://example.com/en/bfts/events.rss'
	};

	var collection = transform.siteToCollection(eventsFeed, syncJob);
	t.equal(collection.type, 'collection', 'sets correct type for site');
	t.equal(collection.relationships.entities.data.length, 1, 'has a releated event');
	var relatedEvent = collection.relationships.entities.data[0];
	t.equal(relatedEvent.type, 'event', 'related event has the right type');

	var event = transform.itemToEntity(eventsFeed.items[0]);
	t.equal(event.title, 'Chicago Invitational', 'sets event title');
	t.equal(event.description, 'Allstate Arena', 'sets event description');
	t.equal(event.ical.location, 'Chicago, IL', 'sets event location');
	t.equal(event.ical.dtstart, '2015-01-10T00:50:00+0000', 'sets event start date');

	t.end();
});
