import path from 'path';
import Koa from 'koa';
import compose from 'koa-compose';
import cors from '@koa/cors';
import logger from 'koa-logger';
import bodyParser from 'koa-body';
import mount from 'koa-mount';
import serveStatic from 'koa-static';
import session from 'koa-session';
import passport from 'koa-passport';
import errorHandler from 'koa-better-error-handler';
import config from './config.js';
import cloudflareAccess from './middleware/cloudflare.js';
import ssr from './middleware/ssr.js';
import AuthController from './controllers/auth.js';
import UserModel from './models/user.js';

const __dirname = path.resolve();
const STATIC_DIR = path.resolve(__dirname, 'dist', 'frontend');
const ENTRYPOINT = path.resolve(STATIC_DIR, 'index.html');

// Initialize our application server
const server = new Koa();

// Setup our API handlers
const users = new UserModel();
const auth = AuthController(users);
const apiV2Router = compose([auth.routes(), auth.allowedMethods()]);

// Add here only development middlewares
if (config.isDev) {
  server.use(logger());
} else {
  server.silent = true;
}

// Set session secrets
server.keys = Array.isArray(config.secrets) ? config.secrets : [config.secrets];

// Set custom error handler
server.context.onerror = errorHandler;

// If we're running behind Cloudflare, set the access parameters.
if (config.cfaccess.url) {
  server.use(cloudflareAccess(config.cfaccess.url, config.cfaccess.audience));
  if (!config.isDev && !config.isTest) {
    server.use(async (ctx, next) => {
      const email = ctx.request.header['cf-access-authenticated-user-email'];
      if (!email) {
        ctx.throw(401, 'Missing header cf-access-authenticated-user-email');
      }
      ctx.state.email = email;
      await next();
    });
  }
}

server
  .use(bodyParser({ multipart: true }))
  .use(session(server))
  .use(passport.initialize())
  .use(passport.session())
  .use(cors())
  .use(mount('/api/v2', apiV2Router))
  .use(mount('/static', serveStatic(STATIC_DIR)))
  .use((ctx, next) => {
    ctx.state.htmlEntrypoint = ENTRYPOINT;
    ssr(ctx, next);
  });

export default server;
