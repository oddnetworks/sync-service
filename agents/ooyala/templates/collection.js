'use strict';

/* eslint-disable camelcase */
var channelToCollection = {
	id: '$.embed_code',
	title: '$.name',
	description: '$.description',
	images: {
		aspect16x9: '$.preview_image_url'
	},
	releaseDate: '',
	updatedAt: '$.updated_at',
	createdAt: '$.created_at',
	relationships: {
	},
	meta: {
		source: 'ooyala',
		sourceId: '$.embed_code',
		sourceType: '$.asset_type',
		publishing_rule_id: '$.publishing_rule_id'
	}
};
/* eslint-enable camelcase */

module.exports = {channelToCollection: channelToCollection};
