'use strict';

const Callback = require('./callback');

/**
 * Should return a JSON document containing `callback` - A URL that can receive an authorization code.
 */
module.exports = exports = {
  path: '/palmetto',
  method: 'get',
  handle: svc => (req, res, next) => {
    res.json({
      callback: svc.config.get('base_url') + Callback.path
    });
  }
}
