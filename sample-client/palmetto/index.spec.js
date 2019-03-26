'use strict';

let { parseHeader } = require('./index');

describe('ID Parser', () => {
  it('should parse a simple header', () => {
    let result = parseHeader('palmetto plmto.com/jason');
    expect(result.domain).toBe('plmto.com');
    expect(result.path).toBe('/jason');
  });

  it('should handle upper case', () => {
    let result = parseHeader('PALMETTO PLMTO.COM/JASON');
    expect(result.domain).toBe('plmto.com');
    expect(result.path).toBe('/JASON');
  });

  it('should accept long paths', () => {
    let result = parseHeader('palmetto plmto.com/ann/bill/carl');
    expect(result.domain).toBe('plmto.com');
    expect(result.path).toBe('/ann/bill/carl');
  });

  it('should accept long domains', () => {
    let result = parseHeader('palmetto palmetto.auth.corporation.com/jason');
    expect(result.domain).toBe('palmetto.auth.corporation.com');
    expect(result.path).toBe('/jason');
  });

  it('should accept some less common characters in the path', () => {
    let result = parseHeader('palmetto plmto.co.uk/o_o/~tim.meh/a+b:1');
    expect(result.domain).toBe('plmto.co.uk');
    expect(result.path).toBe('/o_o/~tim.meh/a+b:1');
  });

  it('should return null if the url does not match', () => {
    let result = parseHeader('palmetto https://plmto.com/jason');
    expect(result).toBeNull();
  });

  it('should return null if the type is not palmetto', () => {
    let result = parseHeader('whatdo plmto.com/jason');
    expect(result).toBeNull();
  });

  it('should not allow a query string', () => {
    let result = parseHeader('palmetto plmto.com/jason?foo=bar');
    expect(result).toBeNull();
  });

  it('should not allow a hash property', () => {
    let result = parseHeader('palmetto plmto.com/jason#foobar');
    expect(result).toBeNull();
  });

  it('should handle non-string inputs', () => {
    expect(parseHeader(undefined)).ToBeNull;
    expect(parseHeader(5)).ToBeNull;
    expect(parseHeader(true)).ToBeNull;
    expect(parseHeader({ potato: 'cake' })).ToBeNull;
    expect(parseHeader(null)).ToBeNull;
  });
});