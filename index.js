'use strict';

var microtime = require('microtime');
var NexStar = require('./lib/nexstar');
var nexstar = new NexStar('/dev/tty.usbserial');

nexstar.ready(function() {
  // var start1 = microtime.now();
  // nexstar.getPrecPosition(function(err, pos) {
  //  console.log('Precision Position:', pos);
  //  var start2 = microtime.now();
  //  console.log('First took:', (start2 - start1) / 1000, 'ms');
  //  nexstar.getPrecPosition(function(err, pos) {
  //    console.log('Precision Position:', pos);
  //    var stop2 = microtime.now();
  //    console.log('Second took:', (stop2 - start2) / 1000, 'ms');
  //  });
  // });

  // nexstar.setPrecPosition(270, 90, function() {
  //   console.log('Position Set');
  // });

  // nexstar.watchGoto(function(err, data) {
  //   console.log('Goto', err, 'data', data);
  // });

  // nexstar.cancelGoto(function(err, data) {
  //   console.log('Cancel Goto', err, 'data', data);
  // });

  nexstar.isGotoInProgress(function(err, data) {
    console.log('Goto in progress?', data, ', Error:', data);
  });

  // nexstar.getPrecPosition(function(err, pos) {
  //   console.log('Precision Position:', pos);
  // });



  nexstar.isAlignmentComplete(function(err, data) {
    console.log('Alignment complete?', data, ', Error:', err);
  });

  // nexstar.testCmd(function(err, data) {
  //   console.log('Testing cmd? Data:', data, ', Error:', err);
  // });


});
