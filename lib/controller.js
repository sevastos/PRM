'use strict';

var calcs = require('./calcs');

/**
 * @param  {Object} driver
 * @param  {Object} equipment {.., camera: {...}, lens: {...}}
 */
function Controller(driver, equipment){
  this.driver = driver;
  this.fovs = this.calculateFoV(equipment);
}

Controller.EQUIP_DSLR = 1;
Controller.EQUIP_TELESCOPE = 2;
Controller.EQUIP_PIGGYBACK = 3;

Controller.camera = require('./cameras');
Controller.lens = require('./lenses');

/**
 * @param  {Object} equipment {type:'', }
 * @return {Object}           {h: #, v: #, d: #}
 */
Controller.prototype.calculateFoV = function(equipment) {
  if (typeof equipment.type === 'undefined') {
    throw new Error('Equipment type undefined.');
  }

  switch(equipment.type) {
  case Controller.EQUIP_DSLR:
    return this.calculateFovDslr(equipment);
  default:
    throw new Error('TODO: Support calculateFov for Equipment: ' + equipment.type);
  }
};

/**
 * @param  {Object} equipment {.., camera: {...}, lens: {...}}
 * @return {Object}           {h: #, v: #, d: #}
 */
Controller.prototype.calculateFovDslr = function(equipment) {
  var camera = getCamera(equipment);
  var lens = getLens(equipment);

  var frameW = 36 / camera.cropFactor;
  var frameH = 24 / camera.cropFactor;
  var frameD = Math.sqrt((frameW * frameW) + (frameH * frameH));

  return {
    h: calcs.ocularToFovDeg(frameW, lens.focalLen),
    v: calcs.ocularToFovDeg(frameH, lens.focalLen),
    d: calcs.ocularToFovDeg(frameD, lens.focalLen)
  };
};

function getCamera(equipment) {
  var camera;
  if (typeof equipment.camera === 'string') {
    camera = Controller.camera[equipment.camera];
  } else {
    camera = equipment.camera;
  }
  return camera;
}

function getLens(equipment) {
  var lens;
  if (typeof equipment.lens === 'string') {
    lens = Controller.lens[equipment.lens];
  } else {
    lens = equipment.lens;
  }
  return lens;
}

module.exports = Controller;
