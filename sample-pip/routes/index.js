'use strict';

const PalmettoRoutes = require('./palmetto');
const LoginRoutes = require('./login');
const UserRoutes = require('./user');

module.exports = [
  ...PalmettoRoutes,
  ...LoginRoutes,
  ...UserRoutes,
];
