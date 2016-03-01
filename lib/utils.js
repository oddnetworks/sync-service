var _ = require('lodash');

module.exports = {
	updateStats: function (stats, results) {
		_.each(results, function (result) {
			stats.total += 1;
			if (result.isFulfilled()) {
				stats.valid += 1;
			} else if (result.isRejected()) {
				stats.invalid += 1;
				stats.errors.push(result.reason());
			}
		});
	}
};
