'use strict';

const { promisify } = require('util');
// const lookupSrv = promisify(require('dns').resolveSrv);
const randomBytes = promisify(require('crypto').randomBytes);
const Callback = require('./callback');
const { unauthorized } = require('boom');
const { parseHeader } = require('palmetto')

/**
 * The endpoint should accept a Palmetto ID as a parameter, and if:
 *
 * - The ID is known to have requested authentication against this server, and
 * - The request comes from a host that is among the SRV records for palmetto for the domain in the ID,
 *
 * Then return a JSON document containing:
 *
 * - `callback` - A URL that can receive the authorization code.
 *   - Can be on a different host, but doing so will result in a warning being displayed by the User Agent.
 * - `state` - an unpredictable value to be included in the callback

Otherwise, send a 401 that explains the problem.
 */
module.exports = exports = {
  path: '/palmetto/handshake',
  method: 'get',
  handle: state => async (req, res, next) => {
    // TODO: validate properly
    if(!req.session.auth || !req.session.auth.palmetto || !req.session.auth.palmetto.id) {
      return next(unauthorized('There is no authentication in progress.'));
    }

    if(req.session.auth.palmetto.id !== req.query.id) {
      return next(unauthorized('The requested authentication was for a different user.'));
    }

    res.json({
      callback: state.config.get('base_url') + Callback.path,
      state: req.session.auth.palmetto.state
    });

    return next();
  }
}
