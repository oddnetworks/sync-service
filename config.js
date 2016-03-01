'use strict';

var env = (process.env.NODE_ENV || 'development');
var mongoUri = (process.env.MONGOLAB_URI || 'mongodb://localhost:27017/device');

/* eslint-disable quote-props */
module.exports = {
	timeout: 90000,
	strict: {
		add: false
	},
	env: env,
	mongodb: {
		uri: mongoUri
	},
	opbeat: {
		appId: process.env.OPBEAT_APP_ID,
		organizationId: process.env.OPBEAT_ORGANIZATION_ID,
		secretToken: process.env.OPBEAT_SECRET_TOKEN,
		logLevel: process.env.OPBEAT_LOG_LEVEL || 'info',
		active: (env === 'production' || env === 'staging'),
		instrument: true,
		hostname: ('sync-service-' + env)
	}
};
/* eslint-enable */
