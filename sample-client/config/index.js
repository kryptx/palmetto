'use strict';

var convict = require('convict');
const schema = require('./schema');

var config = convict(schema);
var env = config.get('env');
config.loadFile('./config/' + env + '.json');
config.validate({allowed: 'strict'});

module.exports = config;
