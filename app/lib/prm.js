'use strict';

var NexStar = require('../../lib/nexstar');
var nexstar = new NexStar('/dev/tty.usbserial');

var Controller = require('../../lib/controller');

var control = new Controller(nexstar, {
  type: Controller.EQUIP_DSLR,
  camera: 'Canon1000D',
  lens: 'Samyang14'
});

module.exports = control;
