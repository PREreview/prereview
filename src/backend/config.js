import Joi from 'joi';
import dotenv from 'dotenv';
import { ServerError } from '../common/errors.js';

/**
 * Generate a validation schema using Joi to check the type of your environment variables
 */
const envSchema = Joi.object({
  NODE_ENV: Joi.string().allow(['development', 'production', 'test']),
  ADMIN_USERNAME: Joi.string()
    .alphanum()
    .min(3)
    .max(32),
  ADMIN_PASSWORD: Joi.string()
    .alphanum()
    .min(12)
    .max(32)
    .required(),
  CFACCESS_AUDIENCE: Joi.string(),
  CFACCESS_URL: Joi.string().uri(),
  PORT: Joi.number(),
  REDIS_HOST: Joi.string(),
  REDIS_PORT: Joi.number(),
  SECRETS: Joi.string().required(),
  WORKER_QUEUE: Joi.string(),
})
  .with('FIXME_CFACCESS_AUDIENCE', 'FIXME_CFACCESS_URL')
  .unknown()
  .required();

/**
 * Optionally load environment from a .env file.
 */

dotenv.config();

/**
 * Validate the env variables using Joi.validate()
 */
const { error, value: envVars } = Joi.validate(process.env, envSchema);
if (error) {
  throw new ServerError('Config validation error', error);
}

export default {
  env: envVars.NODE_ENV,
  isTest: envVars.NODE_ENV === 'test',
  isDev: envVars.NODE_ENV === 'development',
  secrets: envVars.FIXME_SECRETS,
  admin: {
    user: envVars.FIXME_ADMIN_USERNAME || 'admin',
    password: envVars.FIXME_ADMIN_PASSWORD,
  },
  cfaccess: {
    audience: envVars.FIXME_CFACCESS_AUDIENCE,
    url: envVars.FIXME_CFACCESS_URL,
  },
  redis: {
    host: envVars.FIXME_REDIS_HOST || 'localhost',
    port: envVars.FIXME_REDIS_PORT || 6379,
  },
  server: {
    port: envVars.FIXME_PORT || 3000,
  },
  worker: {
    queue: envVars.FIXME_WORKER_QUEUE || '0',
  },
};
