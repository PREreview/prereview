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
import { createError } from '../common/errors.ts';
import { dbWrapper } from './db.ts';
import cloudflareAccess from './middleware/cloudflare.js';
import AuthController from './controllers/auth.js'; // authentication/logins
import authWrapper from './middleware/auth.js'; // authorization/user roles
import {
  commentModelWrapper,
  communityModelWrapper,
  fullReviewModelWrapper,
  groupModelWrapper,
  personaModelWrapper,
  preprintModelWrapper,
  rapidReviewModelWrapper,
  requestModelWrapper,
  tagModelWrapper,
  userModelWrapper,
} from './models/index.ts';
import CommentController from './controllers/comment.js';
import CommunityController from './controllers/community.js';
import GroupController from './controllers/group.js';
import UserController from './controllers/user.js';
import PersonaController from './controllers/persona.js';
import PreprintController from './controllers/preprint.js';
import FullReviewController from './controllers/fullReview.js';
import DocsController from './controllers/docs.js';

const __dirname = path.resolve();
const STATIC_DIR = path.resolve(__dirname, 'dist', 'frontend');

export default async function configServer(config) {
  // Initialize our application server
  const server = new Koa();

  // Configure logging
  log4js.configure({
    appenders: { console: { type: 'stdout', layout: { type: 'colored' } } },
    categories: {
      default: { appenders: ['console'], level: config.logLevel },
    },
  });
  server.use(log4js.koaLogger(log4js.getLogger('http'), { level: 'auto' }));

  // Initialize database
  const [db, dbMiddleware] = await dbWrapper();
  server.use(dbMiddleware);

  // Setup auth handlers
  const userModel = userModelWrapper(db);
  const groupModel = groupModelWrapper(db);
  const personaModel = personaModelWrapper(db);
  const authz = authWrapper(groupModel); // authorization, not authentication
  server.use(authz.middleware());

  // setup API handlers
  const auth = AuthController(userModel, personaModel, config, authz);
  // eslint-disable-next-line no-unused-vars
  const commentModel = commentModelWrapper(db);
  const comments = CommentController(commentModel, authz);
  const communityModel = communityModelWrapper(db);
  const communities = CommunityController(communityModel, authz);
  const fullReviewModel = fullReviewModelWrapper(db);
  const fullReviews = FullReviewController(fullReviewModel, authz);
  const groups = GroupController(groupModel, authz);
  // eslint-disable-next-line no-unused-vars
  const personas = PersonaController(personaModel, authz);
  const preprintModel = preprintModelWrapper(db);
  const preprints = PreprintController(preprintModel, authz);
  // eslint-disable-next-line no-unused-vars
  const rapidReviewModel = rapidReviewModelWrapper(db);
  // eslint-disable-next-line no-unused-vars
  const requestModel = requestModelWrapper(db);
  // eslint-disable-next-line no-unused-vars
  const tagModel = tagModelWrapper(db);
  const users = UserController(userModel, authz);

  fullReviews.use('/prereviews/:pid', comments.middleware());

  const apiV2Router = compose([
    auth.middleware(),
    comments.middleware(),
    communities.middleware(),
    fullReviews.middleware(),
    groups.middleware(),
    personas.middleware(),
    preprints.middleware(),
    users.middleware(),
  ]);

  // set up router for API docs
  const apiDocs = DocsController();

  // Set session secrets
  server.keys = Array.isArray(config.secrets)
    ? config.secrets
    : [config.secrets];

  // Set custom error handler
  server.context.createError = createError;
  server.context.onerror = errorHandler;

  // If we're running behind Cloudflare, set the access parameters.
  if (config.cfaccessUrl) {
    server.use(async (ctx, next) => {
      let cfa = cloudflareAccess();
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
    .use(mount('/api', apiDocs.middleware()))
    .use(mount('/api/v2', apiV2Router))
    .use(serveStatic(STATIC_DIR));

  return server.callback();
}
