var MyPromise = require('./MyPromise');

module.exports.deferred = function() {
		var p = new MyPromise();
		return {
			promise: p,
			resolve: p.fulfill,
			reject: p.reject
		}
}
