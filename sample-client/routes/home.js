'use strict';

const { allowPalmettoLogin } = require('../authorization/middleware');

module.exports = exports = {
  path: '/',
  method: 'get',
  handle: svc => [
    allowPalmettoLogin(svc),
    (req, res, next) => {
      let response = '<!-- DOCTYPE html --><html><head><title>Palmetto Demo App</title></head><body><p>Welcome to our website!</p>';
      if(req.session.user) {
        response += `<p>You are currently logged in as <strong>${req.session.user.id.palmetto}</strong>, but I'll call you by your display name, "${req.session.user.name.display}".</p>`;
        response += `<p>If I ever need to reach you, I'll e-mail you at ${req.session.user.address.email}.</p>`;
      }
      else {
        response += `<p>You currently are not logged in.</p>`;
      }
      response += '</body></html>'
      res.send(response);
    }
  ]
}
