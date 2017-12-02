function MyPromise(exec) {

	var self = this;
	var states = {
		pending: 0,
		fulfilled: 1,
		rejected: 2
	};
	self._state = states.pending;
	self._fns = [];

	function changeState(state, x) {
		if (self._state === states.pending) {
			self._state = state;
			self._x = x;
			self._fns.forEach(function(fn) {
				fn();
			});
		}
	}
	self.fulfill = function(value) {
		changeState(states.fulfilled, value);
	};

	self.reject = function(reason) {
		changeState(states.rejected, reason);
	};

	self.then = function(onFulfilled, onRejected) {
		var p = new MyPromise();

		function insertToExeSeq() {
			setTimeout(function() {
				try {
					onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function(value) {
						return value;
					};
					onRejected = typeof onRejected === 'function' ? onRejected : function(reason) {
						throw reason;
					};
					var x = self._state === states.fulfilled ? onFulfilled(self._x) : onRejected(self._x);
					resolute(p, x);
				} catch (e) {
					p.reject(e);
				}
			});
		}
		if (self._state === states.pending) {
			self._fns.push(insertToExeSeq);
		} else insertToExeSeq();

		return p;
	};
	if(typeof exec === 'function')exec(self.fulfill,self.reject);
}

function resolute(promise, x) {
	if (promise === x) promise.reject(new TypeError('Promise and x should not be the same object'));
	if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
		try {
			var called = false;
			var then = x.then;
			if (typeof then === 'function') {
				then.call(x, function(y) {
					if (!called) {
						called = true;
						resolute(promise, y);
					}
				}, function(r) {
					if (!called) {
						called = true;
						promise.reject(r);
					}
				});
			} else promise.fulfill(x);
		} catch (e) {
			if (!called) {
				called = true;
				promise.reject(e);
			}
		}
	} else promise.fulfill(x);
}


module.exports = MyPromise;