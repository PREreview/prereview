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
import cloudflareAccess from './middleware/cloudflare.js';
import ssr from './middleware/ssr.js';
import AuthController from './controllers/auth.js'; // authentication/logins
import authWrapper from '../backend/middleware/auth.js'; // authorization/user roles
import UserModel from './models/user.js';
import PreprintModel from './models/preprint.js';
import PreprintController from './controllers/preprint.js';
import PrereviewModel from './models/prereview.js';
import PrereviewController from './controllers/prereview.js';

const __dirname = path.resolve();
const STATIC_DIR = path.resolve(__dirname, 'dist', 'frontend');
const ENTRYPOINT = path.resolve(STATIC_DIR, 'index.html');

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

  // Setup auth handlers
  const userModel = new UserModel(); 
  const authz = authWrapper(); // authorization, not authentication
  server.use(authz.middleware());

  // setup API handlers
  const auth = AuthController(userModel, config, authz); 
  const preprintModel = new PreprintModel();
  const preprints = PreprintController(preprintModel, authz);
  const prereviewModel = new PrereviewModel();
  const prereviews = PrereviewController(prereviewModel, authz);
  
  const apiV2Router = compose([
    auth.middleware(), 
    preprints.middleware(),
    // prereviews.middleware(),
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
    .use((ctx, next) => {
      ctx.state.htmlEntrypoint = ENTRYPOINT;
      ssr(ctx, next);
    });

  return server.callback();
}
