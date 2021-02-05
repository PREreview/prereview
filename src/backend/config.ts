import { Command } from 'commander';
import dotenv from 'dotenv';
import { from } from 'env-var';
import { Joi } from 'koa-joi-router';
import orcidUtils from 'orcid-utils';
import log4js from 'koa-log4';
import { isString } from '../common/utils';
import { ServerError } from '../common/errors';

// Configure logging

dotenv.config();
const logLevel =
  process.env[`${process.env.npm_package_name.toUpperCase()}_LOG_LEVEL`] ||
  'error';

log4js.configure({
  appenders: { console: { type: 'stdout', layout: { type: 'colored' } } },
  categories: {
    default: { appenders: ['console'], level: logLevel },
  },
});
const log = log4js.getLogger('backend:config');

/**
 * Optionally load environment from a .env file.
 */

const env = from(process.env, {}, (varname, str) =>
  log.trace(`Environment variable ${varname}: ${str}`),
);

function getEnv(postfix: string, fallback?: string) {
  if (!isString(postfix)) {
    throw new ServerError('Must specify an environment variable to fetch.');
  }
  if (fallback) {
    return env
      .get(
        `${process.env.npm_package_name.toUpperCase()}_${postfix.toUpperCase()}`,
      )
      .default(fallback);
  }

  return env.get(
    `${process.env.npm_package_name.toUpperCase()}_${postfix.toUpperCase()}`,
  );
}

const defaultEnv = isString(process.env.NODE_ENV)
  ? process.env.NODE_ENV
  : 'development';
const defaultPort = isString(process.env.PORT) ? process.env.PORT : '3000';

const defaults = {
  admin_user: 'admin',
  db_name:
    defaultEnv !== 'production'
      ? `${process.env.npm_package_name.toLowerCase()}-${defaultEnv.toLowerCase()}.sqlite3`
      : `${process.env.npm_package_name.toLowerCase()}`,
  db_host: 'localhost',
  db_pool_min: '0',
  db_pool_max: '10',
  db_port: '5432',
  db_timeout: '0',
  db_type: defaultEnv === 'production' ? 'postgresql' : 'sqlite',
  db_user: process.env.npm_package_name.toLowerCase(),
  db_tls: 'false',
  log_level: 'error',
  no_proxy: 'false',
  orcid_sandbox: String(defaultEnv !== 'production'),
  zenodo_sandbox: String(defaultEnv !== 'production'),
  port: defaultPort,
};

function getEnvOrDefault(postfix: string) {
  if (!isString(postfix)) {
    throw new ServerError('Must specify an environment variable to fetch.');
  }
  const defaultValue = defaults[postfix.toLowerCase()];

  if (defaultValue) {
    return getEnv(postfix, defaultValue);
  }

  return getEnv(postfix);
}

function validateOrcidArray(
  value: string,
  previous: Array<string>,
): Array<string> {
  const array = value ? value.split(',') : previous;
  Joi.assert(
    array,
    Joi.array()
      .items(Joi.string().external(value => orcidUtils.isValid(value)))
      .required(),
  );
  return array;
}

function validateBool(value: string, previous: boolean): boolean {
  const bool = value ? String(value).toLowerCase() === 'true' : previous;
  Joi.assert(bool, Joi.boolean());
  return bool;
}

function validateUser(value: string, previous: string): string {
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

function validatePassword(value: string, previous: string): string {
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

function validateUrl(value: string, previous: string): string {
  const url = value ? value : previous;
  Joi.assert(url, Joi.string().uri());
  return url;
}

function validateEmail(value: string, previous: string): string {
  const email = value ? value : previous;
  Joi.assert(email, Joi.string().email());
  return email;
}

function validateToken(value: string, previous: string): string {
  const token = value ? value : previous;
  Joi.assert(token, Joi.string());
  return token;
}

function validateDbtype(value: string, previous: string): string {
  const token = value ? value : previous;
  Joi.assert(token, Joi.string().valid('postgresql', 'sqlite'));
  return token;
}

function validatePool(value: string, previous: number): number {
  const pool = value ? parseInt(value) : previous;
  Joi.assert(
    pool,
    Joi.number()
      .integer()
      .min(0)
      .max(100),
  );
  return pool;
}

function validateTimeout(value: string, previous: number): number {
  const timeout = value ? parseInt(value) : previous;
  Joi.assert(
    timeout,
    Joi.number()
      .integer()
      .min(0),
  );
  return timeout;
}

function validateLoglevel(value: string, previous: string): string {
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
function validateHost(value: string, previous: string): string {
  const host = value ? value : previous;
  Joi.assert(host, Joi.string().required());
  return host;
}

function validatePort(value: string, previous: number): number {
  const port = value ? parseInt(value) : previous;
  Joi.assert(
    port,
    Joi.number()
      .port()
      .required(),
  );
  return port;
}

function validateArray(value: string, previous: Array<string>): Array<string> {
  const array = value ? value.split(',') : previous;
  Joi.assert(
    array,
    Joi.array()
      .items(Joi.string())
      .required(),
  );
  return array;
}

interface ParseOptions {
  from: 'node' | 'electron' | 'user';
}

class Config extends Command {
  constructor(args: string) {
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

  parse(argv?: string[], options?: ParseOptions): any {
    super.parse(argv, options);
    if (!this.cfaccessUrl != !this.cfaccessAudience) {
      throw new ServerError(
        'If using Cloudflare Access both the URL and the Audience must be specified.',
      );
    }

    if (this.dbType === 'postgresql' && !this.dbPass) {
      throw new ServerError(
        'If using Postgres you need to specify a password.',
      );
    }
  }

  get dbUrl() {
    let userpass: string;
    if (this.dbPass) {
      userpass = this.dbUser.concat(':', this.dbPass);
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

const program = new Config(process.env.npm_package_name);

export default program
  .description(process.env.npm_package_description)
  .version(process.env.npm_package_version)
  .option(
    '--admin-users <OrcIDs>',
    'Admin OrcIDs',
    validateOrcidArray,
    getEnvOrDefault('admin_users').asArray(),
  )
  .option(
    '-p, --port <number>',
    'Port for the app to listen on',
    validatePort,
    getEnvOrDefault('port').asInt(),
  )
  .option(
    '-l, --log-level <level>',
    'Logging verbosity',
    validateLoglevel,
    getEnvOrDefault('log_level').asString(),
  )
  .option(
    '-s, --secrets <string>',
    'Session secret(s)',
    validateArray,
    getEnvOrDefault('secrets').asArray(),
  )
  .option(
    '--no-proxy',
    'Disable support for proxy headers',
    validateBool,
    getEnvOrDefault('no_proxy').asBool(),
  )
  .option(
    '--db-host <host>',
    'Database host',
    validateHost,
    getEnvOrDefault('db_host').asString(),
  )
  .option(
    '--db-port <port>',
    'Database port',
    validatePort,
    getEnvOrDefault('db_port').asPortNumber(),
  )
  .option(
    '--db-type <driver>',
    'Database driver (postgresql or sqlite)',
    validateDbtype,
    getEnvOrDefault('db_type').asString(),
  )
  .option(
    '--db-pool-min <connections>',
    'Minimum number of DB pool connections',
    validatePool,
    getEnvOrDefault('db_pool_min').asInt(),
  )
  .option(
    '--db-pool-max <connections>',
    'Maximum number of DB pool connections',
    validatePool,
    getEnvOrDefault('db_pool_max').asInt(),
  )
  .option(
    '--db-timeout <timeout>',
    'Database connection timeout in milliseconds',
    validateTimeout,
    getEnvOrDefault('db_timeout').asInt(),
  )
  .option(
    '--db-name <database>',
    'Database name',
    validateToken,
    getEnvOrDefault('db_name').asString(),
  )
  .option(
    '--db-user <user>',
    'Database user',
    validateUser,
    getEnvOrDefault('db_user').asString(),
  )
  .option(
    '--db-pass <password>',
    'Database password',
    validatePassword,
    getEnvOrDefault('db_pass').asString(),
  )
  .option(
    '--db-tls',
    'Use TLS to connect to the Postgres database',
    validateBool,
    getEnvOrDefault('db_tls').asBool(),
  )
  .option(
    '--cfaccess-url <url>',
    'Cloudflare Access URL',
    validateUrl,
    getEnvOrDefault('cfaccess_url').asString(),
  )
  .option(
    '--cfaccess-audience <token>',
    'Cloudflare Access Audience',
    validateToken,
    getEnvOrDefault('cfaccess_audience').asString(),
  )
  .option(
    '--email-address <email>',
    'From address for email notifications',
    validateEmail,
    getEnvOrDefault('email_address').asString(),
  )
  .option(
    '--email-sendgrid-user <username>',
    'Sendgrid user for sending emails',
    validateToken,
    getEnvOrDefault('email_sendgrid_user').asString(),
  )
  .option(
    '--email-sendgrid-key <key>',
    'Sendgrid token for sending emails',
    validateToken,
    getEnvOrDefault('email_sendgrid_key').asString(),
  )
  .option(
    '--orcid-client-id <id>',
    'OrcID client ID',
    validateUser,
    getEnvOrDefault('orcid_client_id').asString(),
  )
  .option(
    '--orcid-client-secret <secret>',
    'OrcID client secret',
    validatePassword,
    getEnvOrDefault('orcid_client_secret').asString(),
  )
  .option(
    '--orcid-callback-url <url>',
    'OrcID callback URL',
    validateUrl,
    getEnvOrDefault('orcid_callback_url').asString(),
  )
  .option(
    '--orcid-sandbox',
    'Use the OrcID sandbox environment',
    validateBool,
    getEnvOrDefault('orcid_sandbox').asBool(),
  )
  .option(
    '--zenodo-token <url>',
    'Zenodo API token',
    validateToken,
    getEnvOrDefault('zenodo_token').asString(),
  )
  .option(
    '--zenodo-sandbox',
    'Use the Zenodo sandbox environment',
    validateBool,
    getEnvOrDefault('zenodo_sandbox').asBool(),
  );
