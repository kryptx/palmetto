'use strict';

module.exports = exports = {
  path: '/',
  method: 'get',
  ensureLoggedIn: true,
  handle: (req, res, next) => {
    res.json(req.session.user);
  }
}
