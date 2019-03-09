'use strict';

const Url = require('url');
const Request = require('superagent');
const { boomify, unauthorized } = require('boom');

module.exports = exports = {
  path: '/palmetto/callback',
  method: 'get',
  handle: state => [
    (req, res, next) => {
      // send 401 if they wandered in here without a hall pass
      if(!req.params.authorization_code) return next(unauthorized('You must provide an authorization code.'));

      // send 401 if it doesn't look like they have the right stuff in the session
      // TODO: validate properly
      if(!req.session.auth            ||
         !req.session.auth.palmettoId ||
         !req.session.auth.state      ||
         !req.params.state            ||
          req.session.auth.state !== req.params.state) {
            return next(unauthorized('Something went wrong. Please retry the authorization flow from the beginning.'))
      }

      let authParts = req.headers.authorization.split(' ');
      let id = authParts[1];
      if(id !== res.locals.palmettoId) return next(unauthorized('Session ID mismatched authorization header.'));

      try {
        res.locals.palmettoId = Url.parse(id);
      } catch (typeErrorProbably) {
        return next(boomify(typeErrorProbably, { statusCode: 401 } ));
      }
    },
    async (req, res, next) => {
      let response = await Request
        .post(res.locals.palmettoId)
        .send({ authorization_code: req.params.authorization_code })

      if(response.ok) {
        req.session.user = response;
        return next();
      }

      return next(unauthorized('Well. You said no.'))
    }
  ]
}
