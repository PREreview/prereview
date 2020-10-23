import path from 'path';
import Koa from 'koa';
import compose from 'koa-compose';
import cors from '@koa/cors';
import log4js from 'koa-log4';
import bodyParser from 'koa-body';
import mount from 'koa-mount';
import serveStatic from 'koa-static';
import session from 'koa-session';
import passport from 'koa-passport';
import errorHandler from 'koa-better-error-handler';
import dbWrapper from './db.ts';
import cloudflareAccess from './middleware/cloudflare.js';
import AuthController from './controllers/auth.js'; // authentication/logins
import authWrapper from '../backend/middleware/auth.js'; // authorization/user roles
import UserModel from './models/users.ts';
import PreprintModel from './models/preprints.ts';
import PreprintController from './controllers/preprint.js';
import FullReviewModel from './models/fullReviews.ts';
import PrereviewController from './controllers/prereview.js';

const __dirname = path.resolve();
const STATIC_DIR = path.resolve(__dirname, 'dist', 'frontend');

export default function configServer(config) {
  // Initialize our application server
  const server = new Koa();

  // Configure logging
  log4js.configure({
    appenders: { console: { type: 'stdout', layout: { type: 'colored' } } },
    categories: {
      default: { appenders: ['console'], level: config.log_level },
    },
  });
  server.use(log4js.koaLogger(log4js.getLogger('http'), { level: 'auto' }));

  // Initialize database
  const dbType = config.isDev ? 'sqlite' : 'postgres';
  const [db, dbMiddleware] = dbWrapper(
    dbType,
    config.dbHost,
    config.dbPort,
    config.dbName,
    config.dbUser,
    config.dbPass,
  );
  server.use(dbMiddleware);

  // Setup auth handlers
  const userModel = new UserModel(db);
  const authz = authWrapper(); // authorization, not authentication
  server.use(authz.middleware());

  // setup API handlers
  const auth = AuthController(userModel, config, authz);
  const preprintModel = PreprintModel(db);
  const preprints = PreprintController(preprintModel, authz);
  const prereviewModel = FullReviewModel(db);
  const prereviews = PrereviewController(prereviewModel, authz);

  const apiV2Router = compose([
    auth.routes(),
    auth.allowedMethods(),
    preprints.middleware(),
    prereviews.middleware(),
  ]);

  // Add here only development middlewares
  // if (config.isDev) {
  //   server.use(logger());
  // } else {
  //   server.silent = true;
  // }

  // Set session secrets
  server.keys = Array.isArray(config.secrets)
    ? config.secrets
    : [config.secrets];

  // Set custom error handler
  server.context.onerror = errorHandler;

  // If we're running behind Cloudflare, set the access parameters.
  if (config.cfaccess_url) {
    server.use(async (ctx, next) => {
      let cfa = await cloudflareAccess();
      await cfa(ctx, next);
    });
    server.use(async (ctx, next) => {
      let email = ctx.request.header['cf-access-authenticated-user-email'];
      if (!email) {
        if (!config.isDev && !config.isTest) {
          ctx.throw(401, 'Missing header cf-access-authenticated-user-email');
        } else {
          email = 'foo@example.com';
        }
      }
      ctx.state.email = email;
      await next();
    });
  }

  server
    .use(bodyParser({ multipart: true }))
    .use(session(server))
    .use(passport.initialize())
    .use(passport.session())
    .use(cors())
    .use(mount('/api/v2', apiV2Router))
    .use(mount('/static', serveStatic(STATIC_DIR)))
    .use(
      async (ctx, next) =>
        await serveStatic(STATIC_DIR)(
          Object.assign(ctx, { path: 'index.html' }),
          next,
        ),
    );

  return server.callback();
}
