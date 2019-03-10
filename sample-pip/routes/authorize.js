'use strict';

const Joi = require('joi');

const joi = Joi.extend((joi) => ({
  base: joi.array(),
  name: 'stringArray',
  coerce: (value, _, __) => (typeof(value) === 'string' ? value.split(',') : value)
}));

module.exports = exports = {
  path: '/:userId/authorize',
  method: 'get',
  validation: {
    params: Joi.object().keys({
      userId: Joi.string().min(1),
    }),
    query: Joi.object().keys({
      id: Joi.string().regex(/[\w-]+(\.[\w-]+)+\/[\w-\.~:/+]+$/i),
      client: Joi.string().uri({ scheme: 'https' }),
      ivs: joi.stringArray().items(Joi.string())
    })
  },
  handle: (req, res, next) => {
    // this request represents a NEW release authorization.
    // since the user may arrive here with or without a session,
    // store the data and send them to the grant prompt
    // even if the user didn't exist, we wouldn't tell them yet
    req.session.authRequest = { id, client, ivs };
    res.set('Location', '/grantPrompt');
    res.status(303).send();
  }
};
