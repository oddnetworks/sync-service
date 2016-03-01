'use strict';

var test = require('tape');
var BrightcoveTransform = require('../../agents/brightcove/transform.js');
var fs = require('fs');
var path = require('path');

var mockPlaylists = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/playlists.json')));
var mockVideos = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/videos.json')));

test('BrightcoveTransform.playlistToCollection converts playlists to collections', function (t) {
	t.plan(9);

	var res = BrightcoveTransform.playlistToCollection(mockPlaylists[0]);

	t.equal(res.id, 'brightcove-4452341376001', 'It transforms the collection id');
	t.equal(res.type, 'collection', 'It sets the type to collection');
	t.equal(res.title, 'OutLearn Demo Playlist', 'It sets the title to the playlist name');
	t.equal(res.relationships.entities.data.length, 7, 'It processes all associated videos');
	t.equal(res.relationships.entities.data[0].id, 'brightcove-4454723119001', 'It transforms the video id');
	t.equal(res.relationships.entities.data[0].type, 'video', 'It sets the entity type to video');
	t.equal(res.meta.source, 'brightcove', 'It sets the meta.source');
	t.equal(res.meta.sourceId, '4452341376001', 'It sets the meta.sourceId');
	t.equal(res.meta.sourceType, 'playlist', 'It sets the meta.sourceType');
	t.end();
});

test('BrightcoveTransform.videoToVideo converts brightcove video json to odd video json', function (t) {
	t.plan(11);

	var res = BrightcoveTransform.brightcoveToVideo(mockVideos[0]);

	t.equal(res.id, 'brightcove-4492075574001', 'It transforms the video id');
	t.equal(res.type, 'video', 'It sets the type to video');
	t.equal(res.title, 'Sea Marvels!', 'It sets the title to the playlist name');
	t.equal(res.description, 'Well sit right back and here a tale...', 'It sets the description');
	t.equal(res.meta.source, 'brightcove', 'It sets meta source');
	t.equal(res.meta.sourceId, '4492075574001', 'It sets meta sourceId');
	t.equal(res.images.aspect16x9, 'https://bcsecure01-a.akamaihd.net/6/1752604059001/201509/3164/1752604059001_4492153571001_4492075574001-vs.jpg?pubId=1752604059001&videoId=4492075574001', 'it sets the image aspect16x9');
	t.equal(res.url, 'foo', 'It generates a url');
	t.equal(res.meta.source, 'brightcove', 'It sets the meta.source');
	t.equal(res.meta.sourceId, '4492075574001', 'It sets the meta.sourceId');
	t.equal(res.meta.sourceType, 'video', 'It sets the meta.sourceType');
	t.end();
});
