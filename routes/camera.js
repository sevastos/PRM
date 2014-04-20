'use strict';

var express = require('express');
var router = express.Router();

var gphoto = require('gphoto2-wrap');
var MjpegConsumer = require('mjpeg-consumer');


/* GET home page. */
router.get('/feed', function(req, res) {
  res.render('camera/feed', {});
});

router.get('/feed.mjpg', function(req, res){
  var Writable = require('stream').Writable;

  res.set({
    'Cache-Control': 'no-cache',
    //'Content-Type': 'image/jpeg',
    'Content-Type': 'multipart/x-mixed-replace; boundary=nextframe',
    'Connection': 'close',
    'Pragma': 'no-cache'
  });
  //res.setEncoding('binary');
  //ffd8
  gphoto.getCamera(function(camera) {
    var stream = camera.previewFeed(function(childProc){
      // childProc, childProc.stdout
      // for shutdown
      childProc.on('close', function(code) {
        console.log('child process exited with code ' + code);
      });

      function onResEnd() {
        console.log('onResEnd. Killing process');
        if (childProc.pid) {
          childProc.kill('SIGINT');
        } else {
          console.log('onResEnd... looks like already killed');
        }
      }

      res.on('end', onResEnd);
      res.on('finish', onResEnd);
    });

    stream.on('end', function(){
      console.log('Stream ended');
      res.end();
    });

    var maxFps = 15;
    var lastFrame = Date.now();
    var lastChunk;
    var unluckyFrameTimeout;

    function sendFrame(chunk) {
      lastFrame = Date.now();
      res.write('--nextframe\r\n');
      res.write('Content-Type: image/jpeg\r\n');
      res.write('Content-Length: ' + chunk.length + '\r\n');
      res.write('\r\n');
      res.write(chunk, 'binary');
      res.write('\r\n');
    }

    var ws = Writable();
    ws._write = function (chunk, enc, next) {
      if (unluckyFrameTimeout){
        clearTimeout(unluckyFrameTimeout);
      }
      var nextFrameTime = lastFrame + (1000 / maxFps);
      if (nextFrameTime > Date.now()) {
        lastChunk = chunk;
        unluckyFrameTimeout = setTimeout(function() {
          sendFrame(lastChunk);
        }, nextFrameTime - Date.now());
        process.nextTick(next);
        return;        
      }
      sendFrame(chunk);
      //setTimeout(next, 10);
      process.nextTick(next);
    };

    // serve stream
    var consumer = new MjpegConsumer();
    stream.pipe(consumer).pipe(ws);
    //stream.pipe(res);
  });
});

module.exports = router;
