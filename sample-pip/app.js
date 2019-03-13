'use strict';

const Express = require('express');
const Session = require('express-session');
const Apone = require('apone');
const Nano = require('nano');
const BodyParser = require('body-parser');
const Cache = require('node-cache');
const Request = require('superagent');
const { boomify } = require('boom');
const routes = require('./routes');
const { createLogger } = require('bunyan');
const log = createLogger({ name: 'palmetto-pip' })

const config = require('./config');
const db = Nano(`http://${config.get('db.host')}:${config.get('db.port')}`)
  .use(config.get('db.name'));
const cache = new Cache({ stdTTL: 60, checkperiod: 10 });

let app = Express();
app.use([ BodyParser.json(), BodyParser.urlencoded({ extended: true }) ]);
app.set('view engine', 'pug');
app.use(Session({
  secret: config.get('session.secret'),
  resave: false,
  saveUninitialized: true
}));

let apone = new Apone(app);
apone.register(routes, { config, db, cache, Request, log });

app.use(Express.static('public'));

app.use(function(err, req, res, next) {
  if(!err.isBoom) {
    if(err.name === 'ValidationError') {
      err = boomify(err, { statusCode: 400, message: err.message });
    } else {
      console.error(err);
      err = boomify(err);
    }
  }
  let { statusCode, payload } = err.output;
  res.status(statusCode).json(payload);
});


app.listen(3000);
