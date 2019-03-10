'use strict';

const Express = require('express');
const Session = require('express-session');
const Apone = require('apone');
const Nano = require('nano');
const BodyParser = require('body-parser');
const routes = require('./routes');

const config = require('./config');
const db = Nano(`http://${config.get('db.host')}:${config.get('db.port')}`)
  .use(config.get('db.name'));

let app = Express();
app.use([ BodyParser.json(), BodyParser.urlencoded({ extended: false }) ]);
app.set('view engine', 'pug');
app.use(Session({
  secret: config.get('session.secret'),
  resave: false,
  saveUninitialized: true
}));

let apone = new Apone(app);
apone.register(routes, { config, db });

app.use(Express.static('public'));

app.use(function(err, req, res, next) {
  if(!err.isBoom) { return next(err); }
  let { statusCode, payload } = err.output;
  res.status(statusCode).json(payload);
});

app.listen(3000);
