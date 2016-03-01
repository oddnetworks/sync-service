'use strict';

var _ = require('lodash');
var agent = 'brightcove';

module.exports = {
	playlistToCollection: function (playlist) {
		return {
			id: agent + '-' + playlist.id,
			type: 'collection',
			title: playlist.name,
			images: [],
			relationships: {
				entities: {
					data: _.map(playlist.video_ids, function (videoId) {
						return {
							id: agent + '-' + videoId,
							type: 'video'
						};
					})
				}
			},
			meta: {
				source: agent,
				sourceId: playlist.id,
				sourceType: 'playlist'
			}
		};
	},

	brightcoveToVideo: function (videoJSON) {
		var aspect16x9 = null;
		if (videoJSON.images && videoJSON.images.poster) {
			aspect16x9 = videoJSON.images.poster.src;
		}
		return {
			id: agent + '-' + videoJSON.id,
			type: 'video',
			title: videoJSON.name,
			description: videoJSON.long_description,
			images: {
				aspect16x9: aspect16x9
			},
			url: videoJSON.src,
			meta: {
				source: agent,
				sourceId: videoJSON.id,
				sourceType: 'video'
			}
		};
	}
};
