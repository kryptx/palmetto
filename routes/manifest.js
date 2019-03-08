'use strict';

const Callback = require('./callback');

module.exports = exports = {
  path: '/',
  method: 'get',
  handle: state => (req, res, next) => {
    res.json({
      'callback': state.config.get('base_url') + Callback.path
    });
    return next();
  }
}
