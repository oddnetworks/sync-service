var _ = require('lodash');
var crypto = require('crypto');
var moment = require('moment');
var ISO_8601_FORMAT = 'YYYY-MM-DD\THH:mm:ssZZ';

function generateIDHash(url) {
	return crypto.createHash('md5').update(url).digest('hex');
}

function formatDate(item, property) {
	var utcDate = moment(item[property]['#'], moment.ISO_8601).utc();
	var improperlyFormattedDate = moment(item[property]['#']);

	if (utcDate.isValid()) {
		utcDate = utcDate.format(ISO_8601_FORMAT);
	} else if (improperlyFormattedDate.isValid()) {
		utcDate = improperlyFormattedDate.format(ISO_8601_FORMAT);
	} else {
		utcDate = moment().format(ISO_8601_FORMAT);
	}

	return utcDate;
}

module.exports = {
	siteToCollection: function (feed, job) {
		var site = feed.site;
		var items = feed.items;
		var lastBuildDate = moment(site.lastBuildDate);
		if (!lastBuildDate.isValid()) {
			lastBuildDate = moment();
		}

		return {
			id: generateIDHash(job.feedUrl),
			type: 'collection',
			title: site.title,
			link: site.link,
			description: site.description,
			language: site.language,
			generator: site.generator,
			lastBuildDate: lastBuildDate.format(ISO_8601_FORMAT),
			relationships: {
				entities: {
					data: _.compact(
						_.map(items, function (item) {
							return {
								id: generateIDHash(item.guid),
								type: _.has(item, 'xcal:dtstart') ? 'event' : 'article'
							};
						})
					)
				}
			}
		};
	},

	itemToEntity: function (item) {
		var pubDate = moment(item.pubDate);
		if (!pubDate.isValid()) {
			pubDate = moment();
		}

		var entity = {
			id: generateIDHash(item.guid),
			type: 'article',
			title: item.title,
			link: item.link,
			description: _.get(item, 'rss:description.#'),
			category: _.get(item, 'categories[0]'),
			source: item.source,
			createdAt: pubDate.format(ISO_8601_FORMAT),
			images: {
				aspect16x9: _.get(item, "['media:content']['@']", 'https://spaceholder.cc/1920x1080') // eslint-disable-line
			}
		};

		if (_.has(item, 'xcal:dtstart')) {
			entity.type = 'event';
			entity.ical = {
				location: _.get(item, 'xcal:location.#'),
				dtstart: formatDate(item, 'xcal:dtstart'),
				dtend: formatDate(item, 'xcal:dtend')
			};
		}

		return entity;
	}
};
