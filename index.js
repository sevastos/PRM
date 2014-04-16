'use strict';

var NexStar = require('./lib/nexstar');

var nexstar = new NexStar('/dev/tty.usbserial');

nexstar.ready(function() {
	nexstar.getPrecPosition(function(err, pos) {
		console.log('Precision Position:', pos);
	});
});
