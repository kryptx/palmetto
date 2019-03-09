'use strict';
const { parseHeader } = require('palmetto');

module.exports = async (req, res, next) => {
  const palmetto = parseHeader(req.headers.authorization);

  if(palmetto) {
    const srvResult = await lookupSRV(`_palmetto._tcp.${palmetto.domain}`);
    const pip = srvResult[0]; // todo: use priority and weight
    palmetto.url = `https://${pip.name}:${pip.port}${palmetto.path}`;
    palmetto.state = await randomBytes(64).toString('hex');
    req.session.auth = { palmetto };
    res.set('Location', `${palmetto.url}/authorize`);
    res.status(302).send();
  }

  return next();
}