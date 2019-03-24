'use strict';

const { badRequest } = require('boom');
const Joi = require('joi');
const JsonSchema = require('../lib/json-schema');

const rootResponseSchema = Joi.object().keys({
  callback: Joi.string().uri().required(),
  custom: Joi.object().pattern(/\w\.[\w:]+/,
    Joi.object().keys({
      description: Joi.string()
    })
  ),
  validation: Joi.object().pattern(/\w\.[\w:]+/, Joi.object()) // where Joi.object() is a json schema
});

const validate = async body => {
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

module.exports = exports = {
  path: '/grantPrompt',
  method: 'get',
  handle: svc => async (req, res, next) => {
    if(!req.session.user) {
      req.session.next = req.originalUrl;
      res.set('Location', '/login');
      res.status(302).send();
      return;
    }

    if(!req.session.authRequest || req.session.user.palmetto.id !== req.session.authRequest.id) {
      return next(badRequest('No authorization in progress.'));
    }

    try {
      // todo: also get certificate data from this host
      const clientResponse = await svc.Request.get(req.session.authRequest.client).send();
      const client = await validate(clientResponse.body);
      Object.assign(req.session.authRequest, client);
      res.render('prompt', req.session.authRequest);
    } catch (err) {
      // This will send a 500 status code.
      // The problem is probably with the OTHER server.
      return next(boomify(err));
    }
  }
};
