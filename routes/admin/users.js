import express from 'express';

const Router = express.Router();

Router.route('/')
  .get((req, res) => {
    console.log('REQ HIT: ', req.url);
    res.sendStatus(200);
  })
  .post((req, res) => {
    console.log('REQ HIT: ', req.url);
    res.sendStatus(200);
  });

export default Router;
