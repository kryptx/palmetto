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
  handle: ({ Request, log }) => async (req, res, next) => {
    const body = { code: req.query.code };

    // PKCE:
    // if(!get(req.session, 'auth.palmetto.code_challenge_verifier')) {
    //   return next(unauthorized('Unable to verify code challenge.'))
    // } else {
    //   body.code_challenge_verifier = req.session.auth.palmetto.code_challenge_verifier;
    // }

    log.debug(`POSTing data request to ${req.session.auth.palmetto.url}`, body);

    let response = await Request
      .post(req.session.auth.palmetto.url)
      .send(body)
      .catch(err => {
        log.error('Error from user data endpoint', { err });
        return { ok: false };
      });

    if(!response.ok) return next(unauthorized('Authentication failed.'));

    if(get(response.body, 'id.palmetto') !== req.session.auth.palmetto.id) {
      return next(unauthorized('Authentication failed.'));
    }

    req.session.user = response.body;

    let nextUrl = req.session.auth.next || '/';
    delete req.session.auth;
    res.set('Location', nextUrl);
    res.status(302).send();
  }
}
