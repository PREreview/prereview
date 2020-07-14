import jwt from 'koa-jwt';
import jwks from 'jwks-rsa';
import config from '../config.js';

/**
 * Installs the cloudflare access JWT middleware into the koa app.
 *
 * @param {string} url - Cloudflare URL
 * @param {string} audience - Cloudflare audience string
 */
const cloudflareAccess = (url, audience) => {
  // initialize the jwt middleware using CF specific params
  const jwtMiddleware = jwt({
    audience,
    issuer: url,
    cookie: 'CF_Authorization',
    algorithms: ['RS256'],
    debug: true,
    secret: jwks.koaJwtSecret({
      jwksUri: `${url}/cdn-cgi/access/certs`,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 36000000, // 10 hours
    }),
  });
  return async (ctx, next) => {
    if (config.isDev || config.isTest) {
      const { host } = ctx.request.header;
      const skipJwt =
        host.startsWith('localhost') || host.startsWith('127.0.0.1');
      if (!skipJwt) return jwtMiddleware(ctx, next);
      console.warn('SKIPPING JWT VERIFICATION in dev mode', { host });
      return next();
    }
    return jwtMiddleware(ctx, next);
  };
};
export default cloudflareAccess;
