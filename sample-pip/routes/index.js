'use strict';

const GetData = require('./getData');
const Authorize = require('./authorize');
const Whoami = require('./whoami');
const { getLogin, postLogin } = require('./login');
const GrantPrompt = require('./grantPrompt')

module.exports = [
  // GetData,
  Authorize,
  Whoami,
  getLogin,
  postLogin,
  GrantPrompt
];
