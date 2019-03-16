'use strict';

const Joi = require('joi');

const joi = Joi.extend((original) => ({
  base: original.array(),
  name: 'stringArray',
  coerce: (value, _, __) => (typeof(value) === 'string' ? value.split(',') : value)
}));

module.exports = exports = {
  path: '/:userId/authorize',
  method: 'get',
  validation: {
    params: Joi.object().keys({
      userId: Joi.string().min(1).required(),
    }),
    query: Joi.object().keys({
      client: Joi.string().uri({ scheme: 'https' }).required(),
      require: joi.stringArray().items(Joi.string()).default([]),
      request: joi.stringArray().items(Joi.string()).default([]),
      code_challenge: Joi.string().min(1).required(),
      code_challenge_method: Joi.string().only('plain','S256').default('plain')
    })
  },
  handle: ({ config }) => (req, res, next) => {
    // this request represents a NEW release authorization.
    // since the user may arrive here with or without a session,
    // store the data and send them to the grant prompt
    // even if the user didn't exist, we wouldn't tell them yet
    req.session.authRequest = {
      // the choice for a transparent "userId" to be part of the URL is arbitrary.
      // "anonymizing" PIPs may exist that provide opaque identifiers
      id: `${config.get('palmetto.domain')}/${req.params.userId}`,
      userId: req.params.userId,
      client: req.query.client,
      require: req.query.require,
      request: req.query.request,
      code_challenge: req.query.code_challenge,
      code_challenge_method: req.query.code_challenge_method
    };

    res.set('Location', '/grantPrompt');
    res.status(302).send();
  }
};
