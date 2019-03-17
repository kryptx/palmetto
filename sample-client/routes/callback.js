'use strict';

const Joi = require('joi');
const { unauthorized } = require('boom');

module.exports = exports = {
  path: '/palmetto/callback',
  method: 'get',
  validation: {
    query: Joi.object().keys({
      code: Joi.string().min(1).required(),
    })
  },
  handle: ({ Request, log }) => async (req, res, next) => {
    const body = { code: req.query.code };

    // PKCE:
    // const get = require('lodash.get');
    // if(!get(req.session, 'auth.palmetto.code_challenge_verifier')) {
    //   return next(unauthorized('Unable to verify code challenge.'))
    // } else {
    //   body.code_challenge_verifier = req.session.auth.palmetto.code_challenge_verifier;
    // }

    log.trace(`POSTing data request to ${req.session.auth.palmetto.url}`, body);

    let response = await Request
      .post(req.session.auth.palmetto.url)
      .send(body)
      .catch(err => {
        console.error('Error from user data endpoint', { err });
        return { ok: false };
      });

    if(!response.ok) return next(unauthorized('Authentication failed.'));

    req.session.user = response.body;
    req.session.user.id = req.session.auth.palmetto.id;

    let nextUrl = req.session.auth.next || '/';
    delete req.session.auth;
    res.set('Location', nextUrl);
    res.status(302).send();
  }
}
