'use strict';

const { badRequest } = require('boom');

module.exports = exports = {
  path: '/grantPrompt',
  method: 'get',
  handle: (req, res, next) => {
    if(!req.session.auth || req.session.user.palmettoId !== req.session.auth.id) {
      return next(badRequest('No authorization in progress.'));
    }

    if(!req.session.user) {
      req.session.next = req.originalUrl;
      res.set('Location', '/login');
      res.status(302).send();
      return;
    }

    res.render('prompt', req.session.auth);
  }
};
