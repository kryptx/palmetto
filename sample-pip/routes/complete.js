'use strict';

const Querystring = require('querystring');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const get = require('lodash.get');
const set = require('lodash.set');
const Joi = require('joi');

function getApprovedData(req) {
  let result = {};
  const approvedValues = req.session.authRequest.require.concat(req.body.allow);
  for(let iv of approvedValues) {
    set(result, iv, get(req.session.user.palmetto, iv));
  }
  return result;
}

module.exports = exports = {
  path: '/complete',
  method: 'post',
  validation: {
    body: Joi.object().keys({
      result: Joi.string().only('Approve','Reject').required(),
      allow: Joi.array().items(Joi.string().min(1)).optional().default([])
    })
  },
  handle: ({ log, cache }) => async (req, res, next) => {
    if(!req.session.user) return next(unauthorized('User not found in session.'));
    if(!req.session.authRequest) return next(unauthorized('Authorization is not currently in progress.'));
    if(!req.body.result) {
      res.set('Location', '/grantPrompt');
      res.status(302).send();
      return;
    }

    log.info(`Grant prompt completed with decision '${req.body.result}'.`, { allow: req.body.allow });
    const cacheSet = promisify(cache.set);
    let callback = req.session.authRequest.callback;

    if(req.body.result === 'Approve') {
      const code = await randomBytes(16).toString('base64');
      cacheSet(code, {
        request: {
          code_challenge: req.session.authRequest.code_challenge,
          code_challenge_method: req.session.authRequest.code_challenge_method
        },
        payload: getApprovedData(req)
      });
      callback += '?' + Querystring.stringify({ code });
    }

    if(req.body.result === 'Reject') {
      callback += '?' + Querystring.stringify({
        error: 'access_denied'
      });
    }

    // the only remaining request needed to complete the flow is from another client.
    delete req.session.authRequest;
    res.set('Location', callback);
    res.status(302).send();
  }
}