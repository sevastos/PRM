'use strict';

var Primus = require('primus');

function setup(expressApp){
  var server = require('http').createServer(expressApp);
  var primus = new Primus(server, {});
  server.listen(3003);
  primus.save(__dirname +'/../public/scripts/vendors/primus.js', function save(err) {
    if (err) {
      console.error('Error saving Primus.js for frontend. Error:', err);
    }
  });
  return primus;
}

module.exports.setup = setup;
