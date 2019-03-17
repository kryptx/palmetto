'use strict';

const { promisify } = require('util');
const { unauthorized } = require('boom');
const Joi = require('joi');
const { createHash } = require('crypto');

module.exports = exports = {
  path: '/:userId',
  method: 'post',
  validation: {
    params: Joi.object().keys({
      userId: Joi.string()
    }),
    body: Joi.object().keys({
      code: Joi.string().min(1).required(),
      code_challenge_verifier: Joi.string().min(1)
    })
  },
  handle: svc => async (req, res, next) => {
    const cacheGet = promisify(svc.cache.get);
    const cacheDel = promisify(svc.cache.del);
    const data = await cacheGet(req.body.code);
    if(!data) {
      return next(unauthorized('Authorization code invalid.'));
    }

    let ccvHash;
    const rawCcv = Buffer.from(req.body.code_challenge_verifier, 'base64');
    switch(data.request.code_challenge_method) {
      case 'S256':
        const hash = createHash('sha256');
        hash.update(rawCcv);
        ccvHash = hash.digest('base64');
        break;
      case 'plain':
        ccvHash = req.body.code_challenge_verifier;
        break;
      default:
        // there was no code challenge (this is probably undefined)
        ccvHash = data.request.code_challenge;
        break;
    }

    if(data.request.code_challenge !== ccvHash) {
      return next(unauthorized('Code challenge failed.'));
    }

    cacheDel(req.body.code);
    res.json(data.payload);
  }
}
