var _ = require('lodash');
var crypto = require('crypto');

function generateIDHash(url) {
	return crypto.createHash('md5').update(url).digest('hex');
}

module.exports = {
	siteToCollection: function (feed, job) {
		var site = feed.site;
		var items = feed.items;
		return {
			id: generateIDHash(job.url),
			type: 'collection',
			title: site.title,
			images: {
				aspect16x9: 'https://spaceholder.cc/1920x1080'
			},
			relationships: {
				entities: {
					data: _.compact(
						_.map(items, function (item) {
							return {
								id: generateIDHash(item.guid),
								type: 'video'
							};
						})
					)
				}
			},
			meta: {
				source: 'itunes'
			}
		};
	},

	itemToVideo: function (item) {
		return {
			id: generateIDHash(item.guid),
			type: 'video',
			title: item.title,
			description: item.description,
			images: {
				aspect16x9: 'https://spaceholder.cc/1920x1080'
			},
			url: item.enclosures[0].url,
			duration: Number(item.enclosures[0].length) || 0,
			meta: {
				source: 'itunes'
			}
		};
	}
};
