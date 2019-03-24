'use strict';

const Joi = require('joi');
const bcrypt = require('bcrypt');
const { unauthorized } = require('boom');

module.exports = {
  path: '/login',
  method: 'post',
  validation: {
    body: Joi.object().keys({
      username: Joi.string().min(1),
      password: Joi.string().min(1)
    })
  },
  handle: ({ db }) => async (req, res, next) => {
    const result = await db.view('by-username', 'username', { key: req.body.username, include_docs: true });
    if(!result.rows.length) return next(unauthorized('Invalid username or password.'));
    const user = result.rows[0].doc;

    const passwordResult = await bcrypt.compare(req.body.password, user.password);
    if(!passwordResult) return next(unauthorized('Invalid username or password.'));

    delete user.password;
    req.session.user = user;

    let nextUrl = '/';
    if(req.session.next) {
      nextUrl = req.session.next;
      delete req.session.next;
    }

    res.set('Location', nextUrl);
    res.status(302).send();
  }
};
