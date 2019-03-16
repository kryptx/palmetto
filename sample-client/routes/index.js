'use strict';

const Root = require('./root');
const Callback = require('./callback');
const Whoami = require('./whoami');
const Home = require('./home');
const Session = {
  path: '/session',
  method: 'get',
  handle: (req, res, next) => {
    res.json(req.session);
  }
}

module.exports = [ Root, Callback, Whoami, Home, Session ];
