'use strict';

const Express = require('express');
const Apone = require('apone');
const routes = require('./routes');
const config = require('./config');

let app = Express();
let apone = new Apone(app);

apone.register(routes, { config });

app.listen(3000);
