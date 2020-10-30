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
// import errorHandler from 'koa-better-error-handler';
import dbWrapper from './db.ts';
import cloudflareAccess from './middleware/cloudflare.js';
import AuthController from './controllers/auth.js'; // authentication/logins
import authWrapper from '../backend/middleware/auth.js'; // authorization/user roles
import CommentModel from './models/comments.ts';
import CommunityModel from './models/communities.ts';
import FullReviewModel from './models/fullReviews.ts';
import GroupModel from './models/groups.ts';
import PersonaModel from './models/personas.ts';
import PreprintModel from './models/preprints.ts';
import RapidReviewModel from './models/rapidReviews.ts';
import RequestModel from './models/requests.ts';
import TagModel from './models/tags.ts';
import UserModel from './models/users.ts';
import CommentController from './controllers/comment.js';
import CommunityController from './controllers/community.js';
import GroupController from './controllers/group.js';
import UserController from './controllers/user.js';
import PreprintController from './controllers/preprint.js';
import PrereviewController from './controllers/prereview.js';
import DocsRouter from './docs/apiDocs.js';

const __dirname = path.resolve();
const STATIC_DIR = path.resolve(__dirname, 'dist', 'frontend');

export default async function configServer(config) {
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
  const dbType = config.isProd ? 'postgresql' : 'sqlite';
  const [db, dbMiddleware] = await dbWrapper(
    dbType,
    config.dbHost,
    config.dbPort,
    config.dbName,
    config.dbUser,
    config.dbPass,
  );
  server.use(dbMiddleware);

  // Setup auth handlers
  const userModel = UserModel(db);
  const groupModel = GroupModel(db);
  const authz = authWrapper(groupModel); // authorization, not authentication
  server.use(authz.middleware());

  // setup API handlers
  const auth = AuthController(userModel, config, authz);
  // eslint-disable-next-line no-unused-vars
  const commentModel = CommentModel(db);
  const comments = CommentController(commentModel, authz);
  const communityModel = CommunityModel(db);
  const communities = CommunityController(communityModel, authz);
  const fullReviewModel = FullReviewModel(db);
  const groups = GroupController(groupModel, authz);
  const prereviews = PrereviewController(fullReviewModel, authz);
  // eslint-disable-next-line no-unused-vars
  const personaModel = PersonaModel(db);
  const preprintModel = PreprintModel(db);
  const preprints = PreprintController(preprintModel, authz);
  // eslint-disable-next-line no-unused-vars
  const rapidReviewModel = RapidReviewModel(db);
  // eslint-disable-next-line no-unused-vars
  const requestModel = RequestModel(db);
  // eslint-disable-next-line no-unused-vars
  const tagModel = TagModel(db);
  const users = UserController(userModel, authz);
  const apiDocs = DocsRouter();

  prereviews.use('/prereviews/:pid', comments.middleware());

  const apiV2Router = compose([
    apiDocs.middleware(),
    auth.middleware(),
    comments.middleware(),
    communities.middleware(),
    groups.middleware(),
    preprints.middleware(),
    prereviews.middleware(),
    users.middleware(),
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
  // server.context.onerror = errorHandler;

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
