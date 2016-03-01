'use strict';

var request = require('request-promise');
// var Promise = require('bluebird');
var _ = require('lodash');

function BrightcoveApiClient(accountId, clientId, clientSecret) {
	this.accountId = accountId;
	this.clientId = clientId;
	this.clientSecret = clientSecret;
	this.brightcoveRoot = 'https://cms.api.brightcove.com/v1/accounts/' + this.accountId;
}

BrightcoveApiClient.prototype = {
	fetchVideos: function () {
		var self = this;
		return this.getToken().then(function (accessToken) {
			return request({
				method: 'GET',
				uri: self.brightcoveRoot + '/videos',
				auth: {
					bearer: accessToken
				},
				json: true
			}).catch(function (err) {
				console.log(err);
			});
		});
	},

	fetchCollections: function () {
		var self = this;
		return this.getToken().then(function (accessToken) {
			return request({
				method: 'GET',
				uri: self.brightcoveRoot + '/playlists',
				auth: {
					bearer: accessToken
				},
				json: true
			}).catch(function (err) {
				console.log(err);
			});
		});
	},

	fetchVideoSources: function (videoId) {
		var self = this;
		return this.getToken().then(function (accessToken) {
			return request({
				method: 'GET',
				uri: self.brightcoveRoot + '/videos/' + videoId + '/sources',
				auth: {
					bearer: accessToken
				},
				json: true
			});
		});
	},

	fetchHighestQualityVideoSourceUrl: function (videoId) {
		return this.fetchVideoSources(videoId).then(function (sources) {
			var mp4Sources = _.filter(sources, {container: 'MP4'});
			return _.last(_.sortBy(mp4Sources, 'encoding_rate')).src;
		});
	},

	getToken: function () {
		if (this._tokenTimedOut()) {
			var self = this;
			return request({
				method: 'POST',
				uri: 'https://oauth.brightcove.com/v3/access_token',
				qs: {
					grant_type: 'client_credentials', // eslint-disable-line
					client_id: this.clientId, // eslint-disable-line
					client_secret: this.clientSecret // eslint-disable-line
				}
			}).then(function (res) {
				res = JSON.parse(res);
				self.accessToken = res.access_token;  // eslint-disable-line
				self._tokenTimeout =  self._now() + res.expires_in  // eslint-disable-line
				return self.accessToken;
			});
		}

		return Promise.resolve(this.accessToken);
	},

	_tokenTimedOut: function () {
		if (this._tokenTimeout && (this._now() < this._tokenTimeout)) {
			return false;
		}
		return true;
	},

	_now: function () {
		return new Date().getTime() / 1000;
	},

	_encodedCredentials: function () {
		return new Buffer(this.clientId + ':' + this.clientSecret).toString('base64');
	}
};

exports = module.exports = BrightcoveApiClient;
exports.version = '0.0.1';
