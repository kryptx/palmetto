'use strict';

module.exports = {
  path: '/login',
  method: 'get',
  handle: (req, res, next) => res.render('login')
};
