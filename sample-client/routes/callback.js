'use strict';

const Joi = require('joi');
const { unauthorized } = require('boom');
const get = require('lodash.get');

module.exports = exports = {
  path: '/palmetto/callback',
  method: 'get',
  validation: {
    query: Joi.object().keys({
      code: Joi.string().min(1).required(),
    })
  },
  handle: svc => async (req, res, next) => {
    if(!get(req.session, 'auth.palmetto.code_challenge_verifier')) {
      return next(unauthorized('Unable to verify code challenge.'))
    }

    let response = await svc.Request
      .post(req.session.auth.palmetto.url)
      .send({
        code: req.query.code,
        code_challenge_verifier: req.session.auth.palmetto.code_challenge_verifier
      })

    if(!response.ok) {
      return next(unauthorized('Authentication failed.'))
    }

    req.session.user = response;
    let nextUrl = req.session.auth.next || '/';
    delete req.session.auth;
    res.set('Location', nextUrl);
    res.status(303).send();
  }
}
