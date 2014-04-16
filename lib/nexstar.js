'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var debug = require('debug')('driver:nexstar');
var __ = require('lodash');

var SerPro = require('./serpro');
var calcs = require('./calcs');

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
 * @param  {Function} next @next(err, {azm:..., alt:...})
 */
NexStar.prototype.getPrecPosition = function(next) {
  debug('Precise Position: Requesting...');
  var _this = this;
  this.serPro.queue('z', function(err, data) {
    debug('Precise Position: Received reply. Data:', data, '. Error:', err);
    if (err) {
      console.error('Got error when asking for precise position.', err);
      return next(err);
    }
    data = data.split(',');
    var pos = {
      azm: calcs.hex32toDegrees(data[0]),
      alt: calcs.hex32toDegrees(data[1])
    };
    _this.lastPos = pos;
    next(null, pos);
  });
};

/**
 * Set high precision position
 * @param {[type]}   azm  [description]
 * @param {[type]}   alt  [description]
 * @param {Function} next [description]
 */
NexStar.prototype.setPrecPosition = function(azm, alt, next) {
  debug('Precise Position: Setting to AZM:', azm, ', ALT:', alt);

  var cmd = [
    'b',
    calcs.degreesToHex32(azm),
    ',',
    calcs.degreesToHex32(alt)
  ].join('');

  var _this = this;
  this.serPro.queue(cmd, function(err, data) {
    debug('Precise Position: Set. Received reply. (GoTo starting) Data:', data, '. Error:', err);

    _this.watchSlewEnd(function() {
      debug('Goto finished');
    });

    if (err) {
      console.error('Got error when setting precise position.', err);
      return next(err);
    }
    next(null, data);
  });
};

NexStar.prototype.watchSlewEnd = function(next) {
  var _this =  this;
  var lastPos = this.lastPos;
  var afterSlew = next;
  this.getPrecPosition(function(err, pos) {
    if (__.isEqual(lastPos, pos)) {
      debug('watchSlewEnd', 'Finished slewing!');
      afterSlew();
    } else {
      debug('watchSlewEnd', 'Retry...');
      setTimeout(function() {
        process.nextTick(function(){
          _this.watchSlewEnd(afterSlew);
        });
      }, 1900);
    }
  });
};

// BUGGY PROTOCOL
NexStar.prototype.watchGoto = function(next) {
  var _this = this;
  var _arguments = arguments;
  setTimeout(function() {
    _this.isGotoInProgress(function(err, data) {
      debug('[watchGoto:isGotoInProgress:cb]', 'reply:', data, 'Len:', (data ? data.length : 0), 'ERR:', err);
      if (+data === 0) {
        debug('[watchGoto:isGotoInProgress:cb]', 'Goto finished!');
        next();
      } else {
        debug('[watchGoto:isGotoInProgress:cb]', 'Goto in progress...');
        process.nextTick(function() {
          _this.watchGoto.apply(_this, _arguments);
        });
      }
    });
  }, 2900);
};

NexStar.prototype.isGotoInProgress = function(next) {
  debug('[isGotoInProgress]', 'Requesting Goto Status...');
  this.serPro.queue('L', function(err, data) {
    debug('[isGotoInProgress:cmd:cb]', 'Received reply. Data:', data, '. Error:', err);
    if (err) {
      console.error('Got error when checking GoTo status.', err);
      return next(err);
    }
    next(null, +data === 1);
  });
};

NexStar.prototype.cancelGoto = function(next) {
  debug('[cancelGoto]', 'Cancelling Goto Status...');
  this.serPro.queue('M', function(err, data) {
    console.log('Cancelled GoTo');
    next();
  });
};


NexStar.prototype.isAlignmentComplete = function(next) {
  debug('[isAlignmentComplete]', 'Querying...');
  this.serPro.queue('J', function(err, data) {
    debug('[isAlignmentComplete:cmd:cb]', 'Received reply. Data:', data, '. Error:', err);
    if (err) {
      console.error('Got error when checking alignment status.', err);
      return next(err);
    }
    next(null, data);
  });
};


NexStar.prototype.testCmd = function(next) {
  debug('[testCmd]', 'Querying...');
  this.serPro.queue('T1', function(err, data) {
    debug('[testCmd:cmd:cb]', 'Received reply. Data:', data, '. Error:', err);
    if (err) {
      console.error('Got error when testing new cmd.', err);
      return next(err);
    }
    next(null, data);
  });
};


module.exports = NexStar;
