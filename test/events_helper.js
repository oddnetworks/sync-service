var oddcast = require('oddcast');
var events = oddcast.eventChannel();
var transport = oddcast.inprocessTransport();
events.use({role: 'store'}, transport);

module.exports = events;
