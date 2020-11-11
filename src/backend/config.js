import { Command } from 'commander';
import Joi from 'joi';
import dotenv from 'dotenv';

/**
 * Optionally load environment from a .env file.
 */

dotenv.config();

const defaults = {
  loglevel: process.env.PREREVIEW_LOG_LEVEL || 'error',
  admin: {
    user: process.env.PREREVIEW_ADMIN_USERNAME || 'admin',
    password: process.env.PREREVIEW_ADMIN_PASSWORD,
  },
  cfaccess: {
    audience: process.env.PREREVIEW_CFACCESS_AUDIENCE,
    url: process.env.PREREVIEW_CFACCESS_URL,
  },
  db: {
    host: process.env.PREREVIEW_DB_HOST || 'localhost',
    port: process.env.PREREVIEW_DB_PORT || 5432,
    database: process.env.PREREVIEW_DB_DATABASE || 'prereview',
    user: process.env.PREREVIEW_DB_USERNAME || 'prereview',
    password: process.env.PREREVIEW_DB_PASSWORD,
    pool_min: process.env.PREREVIEW_DB_POOL_MIN || 0,
    pool_max: process.env.PREREVIEW_DB_POOL_MAX || 10,
    timeout: process.env.PREREVIEW_DB_TIMEOUT || 0,
  },
  orcid: {
    client_id: process.env.PREREVIEW_ORCID_CLIENT_ID,
    client_secret: process.env.PREREVIEW_ORCID_CLIENT_SECRET,
    sandbox: process.env.PREREVIEW_ORCID_SANDBOX || 'false',
  },
  secrets: process.env.PREREVIEW_SECRETS,
  server: {
    port: process.env.PREREVIEW_PORT || '3000',
  },
};

function validateBool(value, previous) {
  const bool = value ? value : previous;
  Joi.assert(bool, Joi.boolean());
}

function validateUser(value, previous) {
  const user = value ? value : previous;
  Joi.assert(
    user,
    Joi.string()
      .alphanum()
      .min(3)
      .max(32)
      .required(),
  );
  return user;
}

function validatePassword(value, previous) {
  const password = value ? value : previous;
  Joi.assert(
    password,
    Joi.string()
      .alphanum()
      .min(10)
      .max(64)
      .required(),
  );
  return password;
}

function validateUrl(value, previous) {
  const url = value ? value : previous;
  Joi.assert(url, Joi.string().uri());
  return url;
}

function validateToken(value, previous) {
  const token = value ? value : previous;
  Joi.assert(token, Joi.string());
  return token;
}

function validatePool(value, previous) {
  const pool = value ? parseInt(value) : parseInt(previous);
  Joi.assert(
    pool,
    Joi.number()
      .integer()
      .min(0)
      .max(100),
  );
  return pool;
}

function validateTimeout(value, previous) {
  const timeout = value ? parseInt(value) : parseInt(previous);
  Joi.assert(
    timeout,
    Joi.number()
      .integer()
      .min(0),
  );
  return timeout;
}

function validateLoglevel(value, previous) {
  const level = value ? value : previous;
  Joi.assert(
    level,
    Joi.string()
      .allow('trace', 'debug', 'info', 'warn', 'error', 'fatal')
      .required(),
  );
  return level;
}

// eslint-disable-next-line no-unused-vars
function validateHost(value, previous) {
  const host = value ? value : previous;
  Joi.assert(host, Joi.string().required());
  return host;
}

function validatePort(value, previous) {
  const port = value ? parseInt(value) : parseInt(previous);
  Joi.assert(
    port,
    Joi.number()
      .port()
      .required(),
  );
  return port;
}

// eslint-disable-next-line no-unused-vars
function validateArray(value, previous) {
  const strings = value ? value : previous;
  const array = strings.split(',');
  Joi.assert(
    array,
    Joi.array()
      .items(Joi.string())
      .required(),
  );
  return strings;
}

class Config extends Command {
  constructor(args) {
    super(args);
    this.env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
    Joi.string()
      .allow('development', 'production', 'test')
      .required()
      .validate(this.env);
    this.isDev = this.env === 'development';
    this.isTest = this.env === 'test';
    this.isProd = this.env === 'production';
  }

  parse(args) {
    super.parse(args);
    if (!this.cfaccess_url != !this.cfaccess_audience) {
      throw new Error(
        'If using Cloudflare Access both the URL and the Audience must be specified.',
      );
    }
  }

  get dbUrl() {
    let userpass;
    if (this.dbPassword) {
      userpass = this.dbUser.concat(':', this.dbPassword);
    } else {
      userpass = this.dbUser;
    }
    const uri =
      'postgresql://' +
      userpass +
      '@' +
      this.dbHost +
      ':' +
      this.dbPort +
      '/' +
      this.dbDatabase;
    return uri;
  }
}

const program = new Config();

export default program
  .description(process.env.npm_package_description)
  .version(process.env.npm_package_version)
  .option(
    '--username <username>',
    'Admin username',
    validateUser,
    defaults.admin.user,
  )
  .option(
    '--password <password>',
    'Admin password',
    validatePassword,
    defaults.admin.password,
  )
  .option(
    '-p, --port <number>',
    'Port for the app to listen on',
    validatePort,
    defaults.server.port,
  )
  .option(
    '-l, --log_level <level>',
    'Logging verbosity',
    validateLoglevel,
    defaults.loglevel,
  )
  .option(
    '-s, --secrets <string>',
    'Session secret(s)',
    validateArray,
    defaults.secrets,
  )
  .option('--no-proxy', 'Disable support for proxy headers')
  .option('--db-host <host>', 'Database host', validateHost, defaults.db.host)
  .option('--db-port <port>', 'Database port', validatePort, defaults.db.port)
  .option(
    '--db-pool-min <connections>',
    'Minimum number of DB pool connections',
    validatePool,
    defaults.db.pool_min,
  )
  .option(
    '--db-pool-max <connections>',
    'Maximum number of DB pool connections',
    validatePool,
    defaults.db.pool_max,
  )
  .option(
    '--db-timeout <timeout>',
    'Database connection timeout in milliseconds',
    validateTimeout,
    defaults.db.timeout,
  )
  .option(
    '--db-name <database>',
    'Database name',
    validateToken,
    defaults.db.database,
  )
  .option('--db-user <user>', 'Database user', validateUser, defaults.db.user)
  .option(
    '--db-pass <password>',
    'Database password',
    validatePassword,
    defaults.db.password,
  )
  .option(
    '--cfaccess_url <url>',
    'Cloudflare Access URL',
    validateUrl,
    defaults.cfaccess.url,
  )
  .option(
    '--cfaccess_audience <token>',
    'Cloudflare Access Audience',
    validateToken,
    defaults.cfaccess.audience,
  )
  .option(
    '--orcid_client_id <id>',
    'OrcID client ID',
    validateUser,
    defaults.orcid.client_id,
  )
  .option(
    '--orcid_client_secret <secret>',
    'OrcID client secret',
    validatePassword,
    defaults.orcid.client_secret,
  )
  .option(
    '--orcid_sandbox <bool>',
    'OrcID sandbox environment?',
    validateBool,
    defaults.orcid.sandbox,
  );
