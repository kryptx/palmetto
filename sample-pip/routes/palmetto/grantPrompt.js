'use strict';

const { badRequest } = require('boom');
const Joi = require('joi');
const JsonSchema = require('../../lib/jsonSchema');
const Querystring = require('querystring');
const get = require('lodash.get');
const { standardKeys } = require('../../lib/palmetto')

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

const validateRootResponse = async body => {
  const result = await rootResponseSchema.validate(body);
  result.validators = {};
  if(result.custom) {
    const customKeys = Object.keys(result.custom);
    for(let key of customKeys) {
      result.validators[key] = JsonSchema.compile(result.custom[key]);
    }
  }
  return result;
};

module.exports = exports = {
  path: '/grantPrompt',
  method: 'get',
  ensureLoggedIn: true,
  handle: ({ log, Request }) => async (req, res, next) => {
    if(!req.session.authRequest || req.session.user.palmetto.id.palmetto !== req.session.authRequest.id) {
      return next(badRequest('No authorization in progress.'));
    }

    let clientResponse, client;
    try {
      // todo: also get certificate data from this host
      clientResponse = await Request.get(req.session.authRequest.client).send();
      client = await validateRootResponse(clientResponse.body);
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

    let templateContext = Object.assign({},
      req.session.authRequest, // contents of the request itself
      {
        lodashGet: get,                 // useful in the template
        validation: client.validation,  // needed to verify values meet requirements
        user: req.session.user,         // the actual logged-in user
        keys: Object.assign({}, client.custom, standardKeys)
      }
    );
    res.render('prompt', templateContext);
  }
};
