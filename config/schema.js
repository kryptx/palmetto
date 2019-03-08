'use strict';

module.exports = {
  env: {
    doc: 'The environment configuration file to use',
    format: String,
    default: 'local',
    env: 'APP_ENV'
  },
  ip: {
    doc: "The IP address to bind.",
    format: "ipaddress",
    default: "127.0.0.1",
    env: "IP_ADDRESS",
  },
  port: {
    doc: "The port to bind.",
    format: "port",
    default: 3000,
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
  },
  base_url: {
    doc: "The base URL of this implementation",
    format: String,
    default: "http://localhost",
    env: 'BASE_URL'
  }
}
