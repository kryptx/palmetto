'use strict';

const GetData = require('./getData');
const Authorize = require('./authorize');
const Complete = require('./complete');
const Whoami = require('./whoami');
const { getLogin, postLogin } = require('./login');
const GrantPrompt = require('./grantPrompt')

module.exports = [
  Authorize,
  Complete,
  GetData,
  GrantPrompt,
  getLogin,
  postLogin,
  Whoami,
];
