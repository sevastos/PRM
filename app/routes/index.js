'use strict';

var express = require('express');
var router = express.Router();

var prm = require('../lib/prm');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { fov: prm.fovs });
});

module.exports = router;
