'use strict';

module.exports = {
  session: {
    secret: {
      doc: 'A secret value for session signatures',
      format: String,
      default: 'dummy-pip',
      env: 'SESSION_SECRET'
    }
  },
  env: {
    doc: 'The environment configuration file to use',
    format: String,
    default: 'local',
    env: 'APP_ENV'
  },
  port: {
    doc: "The port to bind.",
    format: "port",
    default: 3100,
    env: "PORT",
    arg: "port"
  },
  palmetto: {
    domain: {
      doc: "Palmetto domain that would resolve (via SRV) to this PIP",
      format: String,
      default: "plmto.local",
      env: "PALMETTO_DOMAIN",
    }
  },
  db: {
    host: {
      doc: "CouchDB host name/IP",
      format: '*',
      default: 'localhost',
      env: 'DB_HOST'
    },
    name: {
      doc: "Database name",
      format: String,
      default: 'users',
      env: 'DB_DB'
    },
    port: {
      doc: "Database port",
      format: "port",
      default: 5984,
      env: 'DB_PORT'
    }
  }
}
