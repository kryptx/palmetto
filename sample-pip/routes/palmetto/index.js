'use strict';

const Authorize = require('./authorize');
const Complete = require('./complete');
const GetData = require('./getData');
const Prompt = require('./prompt');

module.exports = [ Authorize, Complete, GetData, Prompt ];
