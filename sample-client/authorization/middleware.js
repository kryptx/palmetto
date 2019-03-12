'use strict';

const { createHash, randomBytes } = require('crypto');
const { promisify } = require('util');
const resolveSrv = promisify(require('dns').resolveSrv);
const { parseHeader } = require('../palmetto');
const { unauthorized } = require('boom');
const Querystring = require('querystring');

async function allowPalmettoLogin(req, res, next) {
  const palmetto = parseHeader(req.headers.authorization);

  if(palmetto) {
    const srvResult = await resolveSrv(`_palmetto._tcp.${palmetto.domain}`);
    const pip = srvResult[0]; // todo: use priority and weight; retry

    const ccv = await randomBytes(32);
    const ccvHash = createHash('sha256');
    ccvHash.update(ccv);
    palmetto.code_challenge_verifier = ccv.toString('base64');

    palmetto.url = `https://${pip.name}:${pip.port}${palmetto.path}`;
    const queryString = Querystring.stringify({
      id: palmetto.id,
      client: palmetto.client,
      require: 'name.display,address.email',
      request: 'location.country',
      code_challenge: ccvHash.digest('base64'),
      code_challenge_method: 'S256',
    });

    req.session.auth = { palmetto, next: req.originalUrl };
    res.set('Location', `${palmetto.url}/authorize?${queryString}`);
    res.status(302).send();
  } else {
    return next();
  }
}

// this is not strictly a palmetto function
function ensureLoggedIn(req, res, next) {
  if(!req.session.user) {
    return next(unauthorized('You must be logged in to view this page. Please use Palmetto to log in.'))
  }
}

module.exports = {
  allowPalmettoLogin,
  ensureLoggedIn
}
