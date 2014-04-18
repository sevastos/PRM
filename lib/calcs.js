'use strict';

var MAX_16BIT = Math.pow(2, 16);
var MAX_32BIT = Math.pow(2, 32);

var calcs = {

  hex16toDegrees: function(hex){
    return parseInt(hex, 16) / MAX_16BIT * 360;
  },

  hex32toDegrees: function(hex){
    return parseInt(hex, 16) / MAX_32BIT * 360;
  },

  /**
   * @param  {Number} degrees Double
   * @return {String}         16-bit integer in hex
   */
  degreesToHex16: function(degrees){
    return (degrees / 360 * MAX_16BIT).toString(16).split('.').shift().toUpperCase();
  },

  /**
   * @param  {Number} degrees Double
   * @return {String}         16-bit integer in hex
   */
  degreesToHex32: function(degrees){
    return (degrees / 360 * MAX_32BIT).toString(16).split('.').shift().toUpperCase();
  },


  // OCULAR

  /**
   * Convert to Field of View degrees
   * @param  {Number} sensorSize  in mm
   * @param  {Number} focalLength in mm (e.x lens')
   * @return {Number}             Field of View degrees
   */
  ocularToFovDeg: function(sensorSize, focalLength){
    return (2 * Math.atan(sensorSize / (2 * focalLength)) * 180 / Math.PI);
  }

};


module.exports = calcs;
