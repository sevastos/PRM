'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var debug = require('debug')('serpro');
var __ = require('lodash');

var SerialPort = require('serialport').SerialPort;

var _convetionDefaults = {
  responseDelimiter: '#',
};

function SerPro(port, opts) {
  var connOpts = opts.connOpts || {};
  this.conventions = __.defaults(_convetionDefaults, opts.conventions || {});
  this.executing = false;
  this.serialPort = new SerialPort(port, connOpts, false);

  this.runningReply = '';
  this.cmdQueue = [];

  var _this = this;
  this.serialPort.on('data', this._processReplyPart.bind(_this));

}

util.inherits(SerPro, EventEmitter);

/**
 * Make connection
 * @api public
 */
SerPro.prototype.connect = function() {
  var _this = this;
  this.serialPort.open(function(err){
    if (err) {
      return console.error('Error while connecting to serial port.', err);
    }
    debug('Connected to serial port');
    _this.emit('connected');
  });
};

/**
 * Send data to serialPort
 * @param  {String}   data
 * @param  {Function} doneResponse  Called when response is assembled @(err, res)
 * @param  {Function?} doneSend     Called when send is completed (not when response is received)
 * @api public
 */
SerPro.prototype.sendNow = function(data, doneResponse, doneSend) {
  // Reply Complete event
  this.once('replyComplete', function() {
    doneResponse(null, this.runningReply);
    _this._cmdFinished();
  });

  // Reply Timeout
  var _this = this;
  this.replyTimeout = function(){
    debug('[write:reply:timeout]', 'Timed out waiting a reply');
    doneResponse({res: 'RES_TIMEOUT'}, _this.runningReply);
    _this._cmdFinished();
  };
  this.replyTimeoutTimer = setTimeout(this.replyTimeout, 3500);

  // Send data
  this.runningReply = '';
  this.serialPort.write(data, function(err, res){
    if (err) {
      console.error('Error returnd when writing data to serial.', err);
    }
    debug('[write:response]', (res instanceof Buffer?res.toString():res));
    if (doneSend) {
      doneSend(err, res);
    }
  });
  return true;
};

/**
 * @see SerPro.sendNow
 * @return {Boolean} Wether the command will be executed now or be queued
 *                   True: Executing now, False: Queuing
 * @api public
 */
SerPro.prototype.queue = function() {
  if (this.executing++) {
    this.cmdQueue.push(arguments);
    return false;
  }
  this.sendNow.apply(this, arguments);
  return true;
};

/**
 * @see SerPro.sendNow
 * @return {Boolean} Wether the command will be executed or not
 * @api public
 */
SerPro.prototype.send = function() {
  if (this.executing++) {
    debug('Send aborted because another command is in progress');
    return false;
  }
  this.sendNow.apply(this, arguments);
  return true;
};

/**
 * Process data stream from serial
 * @param  {Mixed} data
 */
SerPro.prototype._processReplyPart = function(data) {
  // Reset timeout on receiving reply-chunk
  if (this.replyTimeout) {
    clearTimeout(this.replyTimeoutTimer);
    this.replyTimeoutTimer = setTimeout(this.replyTimeout, 3500);
  }

  this._assembleReplyPart(data);

  if (this._isReplyEnding(data)) {
    clearTimeout(this.replyTimeoutTimer);
    this.emit('replyComplete', this.runningReply);
  }
};

SerPro.prototype._assembleReplyPart = function(data) {
  var str = String(data).toString();
  var resDelim = new RegExp(this.conventions.responseDelimiter + '$');
  this.runningReply += str.replace(resDelim, '');
};

/**
 * Check if this is the last part of the total reply
 * @param  {Mixed} data
 * @return {Boolean}      True if it is the last part of the reply
 */
SerPro.prototype._isReplyEnding = function(data) {
  var str = String(data).toString();
  return (str.slice(-1) === this.conventions.responseDelimiter);
};


SerPro.prototype._cmdFinished = function() {
  this.removeAllListeners('replyComplete');
  if (this.cmdQueue.length) {
    this.sendNow.apply(this, this.cmdQueue.shift());
  } else {
    this.executing = false;
  }
};

module.exports = SerPro;
