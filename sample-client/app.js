'use strict';

const Express = require('express');
const Session = require('express-session');
const Apone = require('apone');
const Request = require('superagent');
const routes = require('./routes');
const config = require('./config');
const { createLogger } = require('bunyan');
const log = createLogger({ name: 'palmetto-client' })

let app = Express();
let apone = new Apone(app);

app.use(Session({
  secret: config.get('session.secret'),
  resave: false,
  saveUninitialized: true
}));

apone.register(routes, { config, Request, log });

app.use(function(err, req, res, next) {
  if(!err.isBoom) { return next(err); }
  let { statusCode, payload } = err.output;
  res.status(statusCode).json(payload);
});

app.listen(3000);
