'use strict';

const { parseHeader, getPalmettoUrl } = require('../palmetto');
const { unauthorized } = require('boom');
const Querystring = require('querystring');

const allowPalmettoLogin = ({ config }) => async function checkUserAuthState(req, res, next) {
  const palmetto = parseHeader(req.headers.authorization);
  if(!palmetto) return next();

  palmetto.url = await getPalmettoUrl(palmetto, { overrides: config.get('overrides') });

  const queryString = Querystring.stringify({
    client: `${config.get('base_url')}/palmetto`,
    require: 'name.display,address.email,location.locale,location.tz',
    request: 'location.country',
  });

  // PKCE example
  // const { createHash, randomBytes } = require('crypto');
  // const ccv = await randomBytes(32);
  // const ccvHash = createHash('sha256');
  // ccvHash.update(ccv);
  // palmetto.code_challenge_verifier = ccv.toString('base64');
  // queryString.code_challenge = ccvHash.digest('base64')
  // queryString.code_challenge_method: 'S256',

  req.session.auth = { palmetto, next: req.originalUrl };
  res.set('Location', `${palmetto.url}/authorize?${queryString}`);
  res.status(302).send();
}

// this is not strictly a palmetto function, just something an app might do
function ensureLoggedIn(req, res, next) {
  if(!req.session.user) {
    return next(unauthorized('You must be logged in to view this page. Please use Palmetto to log in.'))
  }
  return next();
}

module.exports = {
  allowPalmettoLogin,
  ensureLoggedIn
}
