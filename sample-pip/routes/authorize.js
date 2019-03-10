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
      id: Joi.string().regex(/[\w-]+(\.[\w-]+)+\/[\w-\.~:/+]+$/i).required(),
      client: Joi.string().uri({ scheme: 'https' }).required(),
      require: joi.stringArray().items(Joi.string()).required(),
      request: joi.stringArray().items(Joi.string()).default([]),
    })
  },
  handle: (req, res, next) => {
    // this request represents a NEW release authorization.
    // since the user may arrive here with or without a session,
    // store the data and send them to the grant prompt
    // even if the user didn't exist, we wouldn't tell them yet
    req.session.authRequest = {
      userId: req.params.userId,
      id: req.query.id,
      client: req.query.client,
      require: req.query.require,
      request: req.query.request || []
    };

    res.set('Location', '/grantPrompt');
    res.status(302).send();
  }
};
