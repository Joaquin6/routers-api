const { Router } = require('express');

Router.route('/')
  .get((req, res) => {
    // eslint-disable-next-line no-console
    console.log('REQ HIT: ', req.url);
    res.sendStatus(200);
  })
  .post((req, res) => {
    // eslint-disable-next-line no-console
    console.log('REQ HIT: ', req.url);
    res.sendStatus(200);
  });

module.exports = Router;
