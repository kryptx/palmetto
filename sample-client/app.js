'use strict';

const Express = require('express');
const Session = require('express-session');
const Apone = require('apone');
const Request = require('superagent');
const BodyParser = require('body-parser');
const routes = require('./routes');
const config = require('./config');
const { createLogger } = require('bunyan');
const log = createLogger({ name: 'palmetto-client' })

let app = Express();
let apone = new Apone(app);
app.set('view engine', 'pug');

app.use([ BodyParser.json(), BodyParser.urlencoded({ extended: true }) ]);
app.use(Express.static('public'));
app.use(Session({
  secret: config.get('session.secret'),
  resave: false,
  saveUninitialized: true
}));

app.use(function(err, req, res, next) {
  if(!err.isBoom) { return next(err); }
  let { statusCode, payload } = err.output;
  if(statusCode === 401) { res.set('WWW-Authenticate', 'Palmetto'); }
  res.status(statusCode).json(payload);
});

apone.register(routes, { config, Request, log });
app.listen(3000);
