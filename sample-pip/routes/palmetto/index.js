'use strict';

const Authorize = require('./authorize');
const Complete = require('./complete');
const GetData = require('./getData');
const GrantPrompt = require('./grantPrompt');

module.exports = [ Authorize, Complete, GetData, GrantPrompt ];
