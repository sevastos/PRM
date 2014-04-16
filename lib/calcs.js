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
  }

};


module.exports = calcs;
