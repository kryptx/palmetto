'use strict';

const Request = require('superagent');
const { unauthorized } = require('boom');
const get = require('lodash.get');

module.exports = exports = {
  path: '/palmetto/callback',
  method: 'get',
  handle: svc => [
    async (req, res, next) => {
      // send 401 if they wandered in here without a hall pass
      if(!req.query.authorization_code) return next(unauthorized('You must provide an authorization code.'));

      // send 401 if it doesn't look like they have the right stuff in the session
      if(get(req.session, 'auth.palmetto.state') !== req.query.state) {
        return next(unauthorized('Something went wrong. Please retry the authorization flow from the beginning.'))
      }

      let response = await Request
        .post(req.session.auth.palmetto.url)
        .send({ authorization_code: req.params.authorization_code })

      if(response.ok) {
        req.session.user = response;
        delete req.session.auth;
        return next();
      }

      return next(unauthorized('What did you expect? You said no.'))
    }
  ]
}
