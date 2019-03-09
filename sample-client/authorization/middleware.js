'use strict';

const { promisify } = require('util');
const resolveSrv = promisify(require('dns').resolveSrv);
const { parseHeader } = require('palmetto');
const { unauthorized } = require('boom');

async function allowPalmettoLogin(req, res, next) {
  const palmetto = parseHeader(req.headers.authorization);

  if(palmetto) {
    const srvResult = await resolveSrv(`_palmetto._tcp.${palmetto.domain}`);
    const pip = srvResult[0]; // todo: use priority and weight; retry
    palmetto.url = `https://${pip.name}:${pip.port}${palmetto.path}`;
    palmetto.state = await randomBytes(32).toString('hex');
    req.session.auth = { palmetto, next: req.originalUrl };
    res.set('Location', `${palmetto.url}/authorize`);
    res.status(302).send();
  } else {
    return next();
  }
}

// this is not strictly a palmetto function; this API happens to only support palmetto
function ensureLoggedIn(req, res, next) {
  if(!req.session.user) {
    return next(unauthorized('You must be logged in to view this page. Please use Palmetto to log in.'))
  }
}

module.exports = {
  allowPalmettoLogin,
  ensureLoggedIn
}
