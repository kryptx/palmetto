'use strict';

const Querystring = require('querystring');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const JsonSchema = require('../../lib/jsonSchema');
const get = require('lodash.get');
const set = require('lodash.set');
const Joi = require('joi');
const { badRequest, boomify } = require('boom');

function getApprovedData(req) {
  let result = { id: { palmetto: req.session.authRequest.id } };
  const approvedValues = req.session.authRequest.require.concat(req.body.allow);
  for(let iv of approvedValues)
    set(result, iv, get(req.session.user.palmetto, iv));

  return result;
}

module.exports = exports = {
  path: '/complete',
  method: 'post',
  validation: {
    body: Joi.object().keys({
      result: Joi.string().only('Approve','Reject').required(),
      allow: Joi.array().items(Joi.string().min(1)).optional().default([]),
      newValue: Joi.object(),
    })
  },
  handle: ({ db, log, cache }) => async (req, res, next) => {
    if(!req.session.user) return next(unauthorized('User not found in session.'));
    if(!req.session.authRequest) return next(unauthorized('Authorization is not currently in progress.'));
    if(!req.body.result) {
      res.set('Location', '/grantPrompt');
      res.status(302).send();
      return;
    }

    let { validation,
          callback,
          code_challenge,
          code_challenge_method,
          require: requiredKeys } = req.session.authRequest;

    let newKeys = [];
    if(req.body.newValue) {
      newKeys = Object.keys(req.body.newValue);
      for(let thisKey of newKeys) {
        // if it's required, or they have agreed to provide it
        if(requiredKeys.includes(thisKey) || req.body.allow[thisKey] === thisKey) {
          let thisValue = req.body.newValue[thisKey];
          // use json schema, if the app requested it
          if(validation[thisKey]) {
            let validator = JsonSchema.compile({ type: 'object', properties: { [thisKey]: validation[thisKey] }, required: [ thisKey ] });
            let valid = validator({ [thisKey]: thisValue });
            if (!valid) {
              return next(boomify(validator.errors[0], {
                statusCode: 400,
                message: `Invalid value sent for ${thisKey}: ${thisValue}`
              }));
            }
          } else {
            // just has to exist
            if(!thisValue.trim().length) {
              return next(badRequest());
            }
          }
        }
      }
    }

    log.info(`Grant prompt completed with decision '${req.body.result}'.`, { allow: req.body.allow });

    if(req.body.result === 'Approve') {
      if(newKeys.length) {
        for(let newKey of newKeys) {
          set(req.session.user.palmetto, newKey, req.body.newValue[newKey]);
        }
        await promisify(db.insert)(req.session.user);
      }

      let cacheBody = { payload: getApprovedData(req) };

      if(code_challenge) {
        cacheBody.code_challenge = code_challenge;
        cacheBody.code_challenge_method = code_challenge_method;
      }

      const cacheSet = promisify(cache.set);
      const code = await randomBytes(16).toString('base64')
      await cacheSet(code, cacheBody);
      callback += '?' + Querystring.stringify({ code });
    }

    if(req.body.result === 'Reject') {
      callback += '?' + Querystring.stringify({ error: 'access_denied' });
    }

    // the only request needed to complete the flow will come from another client.
    // declaring victory...


    delete req.session.authRequest;
    res.set('Location', callback);
    res.status(302).send();
  }
}