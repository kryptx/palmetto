'use strict';
const { parseHeader } = require('palmetto');

module.exports = async (req, res, next) => {
  const palmetto = parseHeader(req.headers.authorization);
  if(palmetto) {
    palmetto.state = await randomBytes(64).toString('hex');
    req.session.auth = { palmetto };
  }
  // TODO: redirect to authorization endpoint
}