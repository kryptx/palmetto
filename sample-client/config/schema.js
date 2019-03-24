'use strict';

module.exports = {
  session: {
    secret: {
      doc: 'A secret value for session signatures',
      format: String,
      default: 'dummy-client',
      env: 'SESSION_SECRET'
    }
  },
  overrides: {
    palmetto_enabled: {
      doc: 'Whether to override a SRV record name in non-production environment',
      format: Boolean,
      default: false,
      env: 'OVERRIDES_PALMETTO_ENABLED'
    },
    palmetto_target: {
      doc: 'The palmetto SRV name to override',
      format: String,
      default: 'plmto.local',
      env: 'OVERRIDES_PALMETTO_TARGET'
    },
    palmetto_name: {
      doc: 'The palmetto host name to return',
      format: String,
      default: 'pip.plmto.local',
      env: 'OVERRIDES_PALMETTO_NAME'
    },
    palmetto_port: {
      doc: 'The palmetto port number to return',
      format: "port",
      default: 3100,
      env: 'OVERRIDES_PALMETTO_PORT'
    },
    palmetto_http: {
      doc: 'Use http to connect to PIP (for development)',
      format: Boolean,
      default: true,
      env: 'OVERRIDES_PALMETTO_HTTP'
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
    default: 3200,
    env: "PORT",
    arg: "port"
  },
  base_url: {
    doc: "The base URL of this implementation",
    format: String,
    default: "http://app.plmto.local:3200",
    env: 'BASE_URL'
  },
  log_level: {
    doc: "The application log level",
    format: String,
    default: "debug",
    env: 'LOG_LEVEL'
  }
}
