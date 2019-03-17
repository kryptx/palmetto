'use strict';

const { promisify } = require('util');
const resolveSrv = promisify(require('dns').resolveSrv);

module.exports = {
  parseHeader: header => {
    if(typeof(header) !== 'string') return null;
    const headerParts = header.match(/palmetto (([\w-]+(\.[\w-]+)+)(\/[\w-\.~:/+]+))$/i);
    if(!headerParts) return null;
    return {
      id: headerParts[1],
      domain: headerParts[2].toLowerCase(),
      path: headerParts[4]
    };
  },
  getPalmettoUrl: async (name, { overrides }) => {
    let scheme = 'https';
    if(process.env.NODE_ENV !== 'production' && overrides.palmetto_enabled && name == overrides.palmetto_target) {
      srvResult = [
        {
          name: overrides.palmetto_name,
          port: overrides.palmetto_port,
          priority: 100,
          weight: 100
        }
      ]

      if(overrides.palmetto_http === true) {
        scheme = 'http';
      }
    } else {
      srvResult = await resolveSrv(`_palmetto._tcp.${name}`);
    }

    const pip = srvResult[0]; // todo: use priority and weight; retry
    return `${scheme}://${pip.name}:${pip.port}${palmetto.path}`;
  }
}
