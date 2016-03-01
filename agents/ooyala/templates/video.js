'use strict';

/* eslint-disable camelcase */
var video = {
	id: '$.embed_code',
	type: '$.asset_type',
	title: '$.name',
	description: '$.description',
	images: {
		aspect16x9: '$.preview_image_url'
	},
	streams: [],
	actors: ['$.metadata[?(/actor\d/)]'],
	tags: ['$.labels..name'],
	duration: '$.duration',
	releaseDate: '',
	updatedAt: '$.updated_at',
	createdAt: '$.created_at',
	meta: {
		source: 'ooyala',
		sourceId: '$.embed_code',
		sourceType: 'video',
		publishing_rule_id: '$.publishing_rule_id'
	}
};
/* eslint-enable camelcase */

module.exports = {
	videos: ['$.*', video],
	video: video
};
