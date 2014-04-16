'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var debug = require('debug')('driver:nexstar');

var SerPro = require('./serpro');

/**
 * 16 bit
 * About 19.8 arcseconds per unit
 * @type {Number}
 */
var normPrecisionRevolution = Math.pow(2, 16);

/**
 * 32 bit - Uses upper 24bits only
 * About 0.08 arcseonds per unit
 * @type {Number}
 */
var highPrecisionRevolution = Math.pow(2, 32);

// http://www.skywatchertelescope.net/swtsupport/Instruction_Manuals/SynScan%20240406V2.pdf
// http://www.celestron.com/c3/images/files/downloads/1154108406_nexstarcommprot.pdf
function NexStar(port) {
  debug('Attaching at port:', port);
  var _this = this;
  this.serPro = new SerPro(port, {
    connOpts: {
      baudrate: 9600,
      flowControl: false
    },
    conventions: {
      responseDelimiter: '#'
    },
  });

  this.serPro.on('connected', function(){
    debug('Ready');
    _this.emit('ready');
    _this.isReady = true;
  });
  this.serPro.connect();
}
util.inherits(NexStar, EventEmitter);

NexStar.prototype.ready = function(next) {
  if (this.isReady) {
    return next();
  }
  this.on('ready', next);
};

/* COMMANDS */

/**
 * Get high precision position
 * @param  {Function} next @next(err, {amz:..., alt:...})
 */
NexStar.prototype.getPrecPosition = function(next) {
  debug('Precise Position: Requesting...');
  this.serPro.queue('z', function(err, data) {
    debug('Precise Position: Received reply. Data:', data, '. Error:', err);
    if (err) {
      console.error('Got error when asking for precise position.', err);
      return next(err);
    }
    data = data.split(',');
    var pos = {
      azm: parseInt(data[0], 16) / highPrecisionRevolution * 360,
      alt: parseInt(data[1], 16) / highPrecisionRevolution * 360
    };
    next(null, pos);
  });
};



module.exports = NexStar;
