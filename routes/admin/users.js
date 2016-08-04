var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  return res.sendStatus(200);
});

router.post('/', function(req, res) {
  return res.sendStatus(201);
});

module.exports = router;
