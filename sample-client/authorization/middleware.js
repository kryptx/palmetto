'use strict';

const { createHash, randomBytes } = require('crypto');
const { promisify } = require('util');
const resolveSrv = promisify(require('dns').resolveSrv);
const { parseHeader } = require('../palmetto');
const { unauthorized } = require('boom');
const Querystring = require('querystring');

const allowPalmettoLogin = ({ config }) => async function checkUserAuthState(req, res, next) {
  const palmetto = parseHeader(req.headers.authorization);
  if(!palmetto) return next();

  let srvResult;
  let scheme = 'https';
  // this is only to support a dev environment. try and move it elsewhere.
  if(process.env.NODE_ENV !== 'production' && config.get(`overrides.palmetto_enabled`) && palmetto.domain == config.get('overrides.palmetto_target')) {
    srvResult = [
      {
        name: config.get('overrides.palmetto_name'),
        port: config.get('overrides.palmetto_port'),
        priority: 100,
        weight: 100
      }
    ]

    if(config.get('overrides.palmetto_http') === true) {
      scheme = 'http';
    }
  } else {
    srvResult = await resolveSrv(`_palmetto._tcp.${palmetto.domain}`);
  }

  const pip = srvResult[0]; // todo: use priority and weight; retry
  const ccv = await randomBytes(32);
  const ccvHash = createHash('sha256');
  ccvHash.update(ccv);
  palmetto.code_challenge_verifier = ccv.toString('base64');

  palmetto.url = `${scheme}://${pip.name}:${pip.port}${palmetto.path}`;
  const queryString = Querystring.stringify({
    client: `${config.get('base_url')}/palmetto`,
    require: 'name.display,address.email,locale,location.tz',
    request: 'location.country',
    code_challenge: ccvHash.digest('base64'),
    code_challenge_method: 'S256',
  });

  req.session.auth = { palmetto, next: req.originalUrl };
  res.set('Location', `${palmetto.url}/authorize?${queryString}`);
  res.status(302).send();

}

// this is not strictly a palmetto function
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
