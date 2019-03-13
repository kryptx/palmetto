'use strict';

const { badRequest } = require('boom');

module.exports = exports = {
  path: '/grantPrompt',
  method: 'get',
  handle: svc => async (req, res, next) => {
    if(!req.session.user) {
      req.session.next = req.originalUrl;
      res.set('Location', '/login');
      res.status(302).send();
      return;
    }

    if(!req.session.authRequest || req.session.user.palmetto.id !== req.session.authRequest.id) {
      return next(badRequest('No authorization in progress.'));
    }

    // todo: also get certificate data from this request
    const client = await svc.Request.get(req.session.authRequest.client).send();
    req.session.authRequest.callback = client.body.callback;

    res.render('prompt', req.session.authRequest);
  }
};
