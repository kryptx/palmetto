'use strict';

const Request = require('superagent');
const Joi = require('joi');
const { unauthorized } = require('boom');
const get = require('lodash.get');

module.exports = exports = {
  path: '/palmetto/callback',
  method: 'get',
  validation: {
    query: Joi.object().keys({
      authorization_code: Joi.string().min(1),
      state: Joi.string().length(64)
    })
  },
  handle: svc => [
    async (req, res, next) => {
      // send 401 if it doesn't look like they have the right stuff in the session
      if(get(req.session, 'auth.palmetto.state') !== req.query.state) {
        return next(unauthorized('State parameter mismatch. A typical app would redirect you to the page you were on, and display a failure message.'))
      }

      let response = await Request
        .post(req.session.auth.palmetto.url)
        .send({ authorization_code: req.query.authorization_code })

      if(!response.ok) {
        return next(unauthorized('User refused to grant at least one required property.'))
      }

      req.session.user = response;
      let url = req.session.auth.next;
      delete req.session.auth;
      res.set('Location', url);
      res.status(303).send();
    }
  ]
}
