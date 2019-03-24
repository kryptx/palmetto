'use strict';

const { badRequest } = require('boom');
const Joi = require('joi');
const JsonSchema = require('../../lib/jsonSchema');

const messages = {
  FAILED_TO_VALIDATE: 'Failed to validate palmetto root response body',
  FAILED_TO_RETRIEVE: 'Failed to retrieve palmetto root document'
};

const rootResponseSchema = Joi.object().keys({
  callback: Joi.string().uri().required(),
  custom: Joi.object().pattern(/\w\.[\w:]+/,
    Joi.object().keys({
      description: Joi.string()
    })
  ),
  validation: Joi.object().pattern(/\w\.[\w:]+/, Joi.object()) // where Joi.object() is a json schema
});

module.exports = exports = {
  path: '/grantPrompt',
  method: 'get',
  ensureLoggedIn: true,
  validation: {
    body: {
      validate: async body => {
        const result = await rootResponseSchema.validate(body);
        result.validators = {};
        if(result.custom) {
          const customKeys = Object.keys(result.custom);
          for(let key of customKeys) {
            results.validators[key] = JsonSchema.compile(result.custom[key]);
          }
        }
        return result;
      }
    }
  },
  handle: svc => async (req, res, next) => {
    if(!req.session.authRequest || req.session.user.palmetto.id !== req.session.authRequest.id) {
      return next(badRequest('No authorization in progress.'));
    }

    let clientResponse, client;
    try {
      // todo: also get certificate data from this host
      clientResponse = await svc.Request.get(req.session.authRequest.client).send();
      client = await validate(clientResponse.body);
    } catch (err) {
      log.warn(`Grant prompt cannot be rendered due to an error.`, { err });
      let callback = req.session.authRequest.callback;
      callback += '?' + Querystring.stringify({
        error: 'server_error',
        error_description: clientResponse ? messages.FAILED_TO_VALIDATE : messages.FAILED_TO_RETRIEVE
      });

      delete req.session.authRequest;
      res.set('Location', callback);
      res.status(302).send();
      return;
    }

    Object.assign(req.session.authRequest, client);
    res.render('prompt', req.session.authRequest);
  }
};
