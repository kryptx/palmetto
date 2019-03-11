'use strict';

const { promisify } = require('boom');
const Joi = require('joi');
const { createHash } = require('crypto');

module.exports = exports = {
  path: '/',
  method: 'post',
  validation: {
    query: Joi.object().keys({
      code: Joi.string().min(1).required(),
      code_challenge_verifier: Joi.string().min(1).required()
    })
  },
  handle: svc => async (req, res, next) => {
    const cacheGet = promisify(svc.cache.get);
    const cacheDel = promisify(svc.cache.del);
    const data = await cacheGet(req.query.code);
    if(!data) {
      return next(unauthorized('Authorization code invalid.'));
    }

    let ccvHash;
    switch(data.code_challenge_method) {
      case 'S256':
        const hash = createHash('sha256');
        hash.update(req.query.code_challenge_verifier);
        ccvHash = hash.digest('base64');
        break;
      default:
      case 'plain':
        ccvHash = req.query.code_challenge_verifier;
        break;
    }

    if(data.code_challenge !== ccvHash) {
      return next(unauthorized('Code challenge failed.'));
    }

    cacheDel(req.query.code);
    res.json(data);
  }
}
