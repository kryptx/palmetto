'use strict';

const Callback = require('./callback');
const KEYS = {
  BITCOIN_ADDRESS: 'address.bitcoin',
  DISPLAY_NAME: 'name.display'
}

/**
 * Should return a JSON document containing `callback` - A URL that can receive an authorization code.
 */
module.exports = exports = {
  path: '/palmetto',
  method: 'get',
  handle: svc => (req, res, next) => {
    res.json({
      callback: svc.config.get('base_url') + Callback.path,
      custom: {
        [KEYS.BITCOIN_ADDRESS]: {
          description: "Bitcoin Address"
        }
      },
      validation: {
        [KEYS.DISPLAY_NAME]: {
          type: "string",
          minLength: 2,
          maxLength: 32
        },
        [KEYS.BITCOIN_ADDRESS]: {
          type: "string",
          pattern: "^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$"
        }
      }
    });
  }
}
