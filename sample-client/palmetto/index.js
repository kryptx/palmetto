'use strict';

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
  }
}
