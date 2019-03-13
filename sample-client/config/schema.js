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
    default: 3000,
    env: "PORT",
    arg: "port"
  },
  base_url: {
    doc: "The base URL of this implementation",
    format: String,
    default: "http://localhost",
    env: 'BASE_URL'
  }
}
