// Node modules
import path from 'path';

// Koa modules
import Koa from 'koa';
import bodyParser from 'koa-body';
import compose from 'koa-compose';
import cors from '@koa/cors';
import log4js from 'koa-log4';
import mount from 'koa-mount';
import passport from 'koa-passport';
import serveStatic from 'koa-static';
import session from 'koa-session';

// Lad modules
import koa404Handler from 'koa-404-handler';
import errorHandler from 'koa-better-error-handler';
import xRequestId from 'koa-better-request-id';
import xResponseTime from 'koa-better-response-time';
import requestReceived from 'request-received';

// Our modules
import { createError } from '../common/errors.ts';
import { dbWrapper } from './db.ts';

// Our middlewares
import cloudflareAccess from './middleware/cloudflare.js';
import authWrapper from './middleware/auth.js'; // authorization/user roles
import currentCommunity from './middleware/community.js';
import currentPersona from './middleware/persona.js';
import currentUser from './middleware/user.js';
import { mailWrapper } from './middleware/mail.js';

// Our models
import {
  badgeModelWrapper,
  commentModelWrapper,
  communityModelWrapper,
  contactModelWrapper,
  eventModelWrapper,
  expertiseModelWrapper,
  fullReviewModelWrapper,
  fullReviewDraftModelWrapper,
  groupModelWrapper,
  keyModelWrapper,
  personaModelWrapper,
  preprintModelWrapper,
  rapidReviewModelWrapper,
  reportModelWrapper,
  requestModelWrapper,
  statementModelWrapper,
  tagModelWrapper,
  templateModelWrapper,
  userModelWrapper,
} from './models/index.ts';

// Our controllers
import AuthController from './controllers/auth.js'; // authentication/logins
import BadgeController from './controllers/badge.js';
import CommentController from './controllers/comment.js';
import CommunityController from './controllers/community.js';
import ExpertiseController from './controllers/expertise.js';
import FullReviewController from './controllers/fullReview.js';
import DraftController from './controllers/fullReviewDraft.js';
import GroupController from './controllers/group.js';
import UserController from './controllers/user.js';
import PersonaController from './controllers/persona.js';
import PreprintController from './controllers/preprint.js';
import RapidController from './controllers/rapidReview.js';
import ReportController from './controllers/report.js';
import RequestController from './controllers/request.js';
import TagController from './controllers/tag.js';
import TemplateController from './controllers/template.js';
import DocsController from './controllers/docs.js';
import EventController from './controllers/event.js';
import NotificationController from './controllers/notification.js';

const __dirname = path.resolve();
const STATIC_DIR = path.resolve(__dirname, 'dist', 'frontend');

const startAt = Symbol.for('request-received.startAt');
const startTime = Symbol.for('request-received.startTime');

export default async function configServer(config) {
  // Initialize our application server
  const server = new Koa();
  server.use(requestReceived);
  server.use((ctx, next) => {
    console.log('startAt', ctx[startAt]);
    console.log('startTime', ctx[startTime]);
    return next();
  });
  server.use(xResponseTime());
  server.use(xRequestId());

  // Configure logging
  log4js.configure({
    appenders: { console: { type: 'stdout', layout: { type: 'colored' } } },
    categories: {
      default: { appenders: ['console'], level: config.logLevel },
    },
  });
  const logger = log4js.getLogger('http');
  server.use(log4js.koaLogger(logger, { level: 'auto' }));
  //server.use(async (ctx, next) => {
  //  ctx.logger = logger;
  //  await next();
  //});

  // Initialize database
  const [db, dbMiddleware] = await dbWrapper();
  server.use(dbMiddleware);

  // Setup auth handlers
  const userModel = userModelWrapper(db);
  const groupModel = groupModelWrapper(db);
  const personaModel = personaModelWrapper(db);
  const contactModel = contactModelWrapper(db);
  const communityModel = communityModelWrapper(db);
  server.use(currentCommunity());
  server.use(currentPersona());
  server.use(currentUser());
  const authz = authWrapper(
    userModel,
    groupModel,
    communityModel,
    personaModel,
  ); // authorization, not authentication

  // setup API handlers
  const auth = AuthController(
    userModel,
    personaModel,
    contactModel,
    config,
    authz,
  );
  const badgeModel = badgeModelWrapper(db);
  const expertiseModel = expertiseModelWrapper(db);
  const badges = BadgeController(badgeModel, authz);
  const expertises = ExpertiseController(expertiseModel, authz);
  const commentModel = commentModelWrapper(db);
  const eventModel = eventModelWrapper(db);
  const fullReviewModel = fullReviewModelWrapper(db);
  const draftModel = fullReviewDraftModelWrapper(db);
  const fullReviewDrafts = DraftController(draftModel, authz);
  const comments = CommentController(commentModel, fullReviewModel, authz);
  const groups = GroupController(groupModel, userModel, authz);
  const personas = PersonaController(
    personaModel,
    userModel,
    badgeModel,
    expertiseModel,
    authz,
  );
  const preprintModel = preprintModelWrapper(db);
  const preprints = PreprintController(preprintModel, authz);
  const rapidReviewModel = rapidReviewModelWrapper(db);
  const rapidReviews = RapidController(rapidReviewModel, preprintModel, authz);
  const reportModel = reportModelWrapper(db);
  const reports = ReportController(
    reportModel,
    commentModel,
    fullReviewModel,
    personaModel,
    rapidReviewModel,
    authz,
  );
  const requestModel = requestModelWrapper(db);
  const requests = RequestController(requestModel, preprintModel, authz);
  const statementModel = statementModelWrapper(db);
  const fullReviews = FullReviewController(
    fullReviewModel,
    draftModel,
    personaModel,
    preprintModel,
    statementModel,
    authz,
  );
  const tagModel = tagModelWrapper(db);
  const tags = TagController(tagModel, authz);
  const templateModel = templateModelWrapper(db);
  const templates = TemplateController(templateModel, communityModel, authz);
  const keyModel = keyModelWrapper(db);
  const users = UserController(userModel, contactModel, keyModel, authz);
  const notifications = NotificationController(userModel, authz);
  const communities = CommunityController(
    communityModel,
    userModel,
    personaModel,
    eventModel,
    tagModel,
    authz,
  );
  const events = EventController(eventModel, authz);

  server.use(authz.middleware());

  const apiDocs = DocsController(authz);

  const apiV2Router = compose([
    auth.middleware(),
    badges.middleware(),
    comments.middleware(),
    communities.middleware(),
    events.middleware(),
    expertises.middleware(),
    fullReviews.middleware(),
    fullReviewDrafts.middleware(),
    groups.middleware(),
    personas.middleware(),
    preprints.middleware(),
    notifications.middleware(),
    rapidReviews.middleware(),
    reports.middleware(),
    requests.middleware(),
    tags.middleware(),
    templates.middleware(),
    users.middleware(),
  ]);

  // Set session secrets
  server.keys = Array.isArray(config.secrets)
    ? config.secrets
    : [config.secrets];

  // Set custom error handler
  server.context.createError = createError;
  server.context.onerror = errorHandler('koa.sess', logger);
  server.context.api = true;

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

  // Manual override of domain to allow for outbreaksci.* subdomain
  const sessionOpts = config.isProd ? { domain: 'prereview.org' } : {};

  server
    .use(bodyParser({ multipart: true, jsonLimit: '50mb' }))
    .use(session(sessionOpts, server))
    .use(passport.initialize())
    .use(passport.session())
    .use(cors())
    .use(mailWrapper(config))
    .use(mount('/api/v2', apiV2Router))
    .use(mount('/api', apiDocs.middleware()))
    .use(koa404Handler)
    .use(serveStatic(STATIC_DIR))
    .use(
      async (ctx, next) =>
        await serveStatic(STATIC_DIR)(
          Object.assign(ctx, { path: 'index.html' }),
          next,
        ),
    );

  return server.callback();
}
