'use strict';

const { allowPalmettoLogin, ensureLoggedIn } = require('../authorization/middleware');

module.exports = exports = {
  path: '/whoami',
  method: 'get',
  handle: svc => [
    allowPalmettoLogin,     // if somebody clicks the 'log in with palmetto' button on this page, it should work
    ensureLoggedIn,         // in order to receive a non-400 response, the user must have an active user session
    async (req, res, next) => {
      res.json({
        status: 'success',
        user: req.session.user
      })
    }
  ]
}
