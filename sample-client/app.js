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
app.use([ BodyParser.json(), BodyParser.urlencoded({ extended: true }) ]);
app.set('view engine', 'pug');
app.use(Session({
  secret: config.get('session.secret'),
  resave: false,
  saveUninitialized: true
}));

let apone = new Apone(app);
apone.register(routes, { config, Request, log });

app.use(Express.static('public'));

app.use(function(err, req, res, next) {
  if(!err.isBoom) { return next(err); }
  let { statusCode, payload } = err.output;
  if(statusCode === 401) { res.set('WWW-Authenticate', 'Palmetto'); }
  res.status(statusCode).json(payload);
});

app.listen(config.get('port'));
log.info('Listening on port ' + config.get('port'));
