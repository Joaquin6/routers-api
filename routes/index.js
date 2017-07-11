import express from 'express';

const Router = express.Router();

Router.get('/', (req, res) => {
  console.log('REQ HIT: ', req.url);
  res.sendStatus(200);
});

export default Router;
