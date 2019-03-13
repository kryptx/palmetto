'use strict';

module.exports = {
  session: {
    secret: {
      doc: 'A secret value for session signatures',
      format: String,
      default: 'dummy',
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
  db: {
    host: {
      doc: "Database host name/IP",
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
      doc: "Database name",
      format: "port",
      default: 5984,
      env: 'DB_PORT'
    }
  }
}
