'use strict';

module.exports = exports = {
  name: 'ensureLoggedIn',
  factoryFunc: (shouldRequire) => (req, res, next) => {
    if(shouldRequire && !req.session.user) {
      req.session.next = req.originalUrl;
      res.set('Location', '/login');
      res.status(302).send();
      return;
    } else {
      return next();
    }
  }
}