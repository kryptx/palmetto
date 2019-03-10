'use strict';

const { unauthorized } = require('boom');

module.exports = exports = {
  path: '/',
  method: 'get',
  handle: (req, res, next) => {
    if(!req.session.user) return next(unauthorized('Not logged in.'));
    res.json(req.session.user);
  }
}
