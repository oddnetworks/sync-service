var test = require('tape');
var transform = require('../../agents/itunes/transform');
var feed = require('./fixtures/feed.json');

test('iTunes: Transform', function (t) {
	t.plan(6);

	var syncJob = {
		agent: 'itunes',
		organization: 'beta',
		url: 'https://www.nasa.gov/rss/dyn/NASAcast_vodcast.rss'
	};

	var collection = transform.siteToCollection(feed, syncJob);
	t.equal(collection.type, 'collection', 'sets correct type for site');
	t.equal(collection.title, 'NASACast Video');
	t.equal(collection.relationships.entities.data.length, 10, 'has a releated event');
	var relatedEvent = collection.relationships.entities.data[0];
	t.equal(relatedEvent.type, 'video', 'related event has the right type');

	var article = transform.itemToVideo(feed.items[0]);
	t.equal(article.title, 'This Week @ NASA, January 22, 2016', 'sets article title');
	t.equal(article.description, 'Oceanography satellite launches, 2015 global temperatures announced and more ...', 'sets article description');

	t.end();
});
