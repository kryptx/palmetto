'use strict';

const { allowPalmettoLogin, ensureLoggedIn } = require('../authorization/middleware');

module.exports = exports = {
  path: '/whoami',
  method: 'get',
  handle: svc => [
    allowPalmettoLogin(svc),     // if somebody clicks the 'log in with palmetto' button on this page, it should work
    ensureLoggedIn,         // in order to receive a non-400 response, the user must have an active user session
    (req, res, next) => res.json({ user: req.session.user })
  ]
}
