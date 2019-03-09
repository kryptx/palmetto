'use strict';

const Callback = require('./callback');
const { unauthorized } = require('boom');
const get = require('lodash.get');

/**
 * The endpoint should accept a Palmetto ID as a parameter, and if the ID is known to have
 * requested authentication against this server, return a JSON document containing:
 *
 * - `callback` - A URL that can receive the authorization code.
 * - `state` - an unpredictable value to be included in the callback
 *
 * Otherwise, send a 401 that explains the problem.
 */
module.exports = exports = {
  path: '/palmetto/handshake',
  method: 'get',
  handle: svc => async (req, res, next) => {
    if(get(req.session, 'auth.palmetto.id') !== req.query.id) {
      return next(unauthorized('The requested authentication was for a different user.'));
    }

    res.json({
      callback: svc.config.get('base_url') + Callback.path,
      state: req.session.auth.palmetto.state
    });
  }
}
