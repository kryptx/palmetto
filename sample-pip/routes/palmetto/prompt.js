'use strict';

const { badRequest } = require('boom');
const Joi = require('joi');
const JsonSchema = require('../../lib/jsonSchema');
const get = require('lodash.get');
const { standardKeys } = require('../../lib/palmetto')

const messages = {
  FAILED_TO_VALIDATE: 'Failed to validate palmetto root response body',
  FAILED_TO_RETRIEVE: 'Failed to retrieve palmetto root document'
};

const rootResponseSchema = Joi.object().keys({
  callback: Joi.string().uri().required(),
  custom: Joi.object().pattern(/\w\.[\w:]+/,
    Joi.object().keys({ description: Joi.string() })
  ),
  validation: Joi.object().pattern(/\w\.[\w:]+/, Joi.object())
});

const validateRootResponse = async body => {
  const result = await rootResponseSchema.validate(body);
  if(result.custom) {
    const customKeys = Object.keys(result.custom);
    for(let key of customKeys) {
      // no point in saving this. can't use it now. this just ensures that we got a valid schema.
      JsonSchema.compile({ type: 'object', properties: { [key]: result.validation[key] } });
    }
  }
  return result;
};

module.exports = exports = {
  path: '/grantPrompt',
  method: 'get',
  ensureLoggedIn: true,
  handle: ({ log, Request }) => async (req, res, next) => {
    if(!req.session.authRequest) {
      return next(badRequest('No authorization in progress.'));
    }

    if(req.session.user.palmetto.id.palmetto !== req.session.authRequest.id) {
      // they are trying to authenticate as a different user.
      // there's room for debate about what should be done about that,
      // but clearing the session and redirecting to login seems safe. (TODO: include an error message)
      req.session = { next: req.originalUrl };
      res.set('Location', '/login');
      res.status(302).send();
      return;
    }

    let clientResponse, client;
    try {
      // todo: also get certificate data from this host
      clientResponse = await Request.get(req.session.authRequest.client).send();
      client = await validateRootResponse(clientResponse.body);
    } catch (err) {
      log.warn(`Grant prompt cannot be rendered due to an error.`, { err });
      return next(unauthorized(clientResponse ? messages.FAILED_TO_VALIDATE : messages.FAILED_TO_RETRIEVE));
    }

    Object.assign(req.session.authRequest, client);
    let templateContext = Object.assign({},
      req.session.authRequest,          // contents of the request itself
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
