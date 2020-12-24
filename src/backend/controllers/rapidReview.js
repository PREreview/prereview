import router from 'koa-joi-router';
import { getLogger } from '../log.js';
import getActivePersona from '../utils/persona.js';

const log = getLogger('backend:controllers:rapidReview');
// const Joi = router.Joi;

// eslint-disable-next-line no-unused-vars
export default function controller(rapidReviews, thisUser) {
  const rapidRouter = router();

  const getHandler = async ctx => {
    let all, pid; // fid = fullReview ID

    if (ctx.params.pid) {
      pid = ctx.params.pid;
      log.debug(
        `Retrieving rapid reviews associated with preprint ${ctx.params.pid}`,
      );
    } else {
      log.debug(`Retrieving all rapid reviews.`);
    }

    try {
      if (pid) {
        all = await rapidReviews.find({ preprint: pid });
      } else {
        all = await rapidReviews.findAll();
      }
    } catch (error) {
      return ctx.throw(400, { message: error.message });
    }

    ctx.body = { status: 200, message: 'ok', data: all };
    ctx.status = 200;
  };

  rapidRouter.route({
    meta: {
      swagger: {
        operationId: 'PostRapidReviews',
        summary: 'Endpoint to POST a rapid review.',
      },
    },
    method: 'post',
    path: '/rapidReviews',
    // pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    // validate: {},
    handler: async ctx => {
      log.debug('Posting a rapid review.');
      let rapidReview, authorPersona;

      try {
        authorPersona = await getActivePersona(ctx.state.user);
      } catch (err) {
        log.error('Failed to load user personas.');
        ctx.throw(400, err);
      }

      try {
        log.debug('authorPersona', authorPersona);
        rapidReview = rapidReviews.create({
          ...ctx.request.body,
          author: authorPersona,
        });
        await rapidReviews.persistAndFlush(rapidReview);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse schema: ${err}`);
      }

      ctx.body = {
        status: 201,
        message: 'created',
        data: [rapidReview],
      };
      ctx.status = 201;
    },
  });

  rapidRouter.route({
    meta: {
      swagger: {
        operationId: 'GetRapidReviews',
        summary: 'Endpoint to GET all rapid reviews.',
      },
    },
    method: 'get',
    path: '/rapidReviews',
    // validate: {},
    handler: getHandler,
  });

  rapidRouter.route({
    meta: {
      swagger: {
        operationId: 'GetPreprintRapidReviews',
        summary: 'Endpoint to GET all rapid reviews of a single preprint.',
        required: true,
      },
    },
    method: 'get',
    path: '/preprints/:pid/rapidReviews',
    // validate: {},
    handler: getHandler,
  });

  rapidRouter.route({
    meta: {
      swagger: {
        operationId: 'GetRapidReview',
        summary: 'Endpoint to GET one rapid review by ID.',
        required: true,
      },
    },
    method: 'get',
    path: '/rapidReviews/:id',
    // pre: thisUser.can('access private pages'),
    // validate: {},
    handler: async ctx => {
      // if (ctx.invalid) {
      //   log.error('400 Error! This is the error object', '\n', ctx.invalid);
      //   handleValidationError(ctx);
      //   return next();
      // }

      log.debug(`Retrieving rapid review ${ctx.params.id}`);
      let rapid;

      try {
        rapid = await rapidReviews.findOne(ctx.params.id, [
          'author',
          'preprint',
        ]);
        if (!rapid) {
          ctx.throw(404, `Rapid review with ID ${ctx.params.id} doesn't exist`);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: [rapid],
      };
    },
  });

  rapidRouter.route({
    meta: {
      swagger: {
        operationId: 'PutRapidReview',
        summary: 'Endpoint to PUT one rapid review by ID.',
        required: true,
      },
    },
    method: 'put',
    path: '/rapidReviews/:id',
    // pre: thisUser.can('access private pages'),
    // validate: {},
    handler: async ctx => {
      // if (ctx.invalid) {
      //   log.error('400 Error! This is the error object', '\n', ctx.invalid);
      //   handleValidationError(ctx);
      //   return next();
      // }

      log.debug(`Updating rapid review ${ctx.params.id}`);
      let rapid;

      try {
        rapid = await rapidReviews.findOne(ctx.params.id);
        if (!rapid) {
          ctx.throw(404, `Rapid review with ID ${ctx.params.id} doesn't exist`);
        }
        rapidReviews.assign(rapid, ctx.request.body);
        await rapidReviews.persistAndFlush(rapid);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse schema: ${err}`);
      }

      // if updated
      ctx.status = 204;
    },
  });

  rapidRouter.route({
    meta: {
      swagger: {
        operationId: 'DeleteRapidReview',
        summary: 'Endpoint to DELETE one rapid review by ID.',
        required: true,
      },
    },
    method: 'delete',
    path: '/rapidReviews/:id',
    // pre: thisUser.can('access private pages'),
    // validate: {},
    handler: async ctx => {
      log.debug(`Updating rapid review ${ctx.params.id}`);
      let rapid;

      try {
        rapid = await rapidReviews.findOne(ctx.params.id);
        if (!rapid) {
          ctx.throw(404, `Rapid review with ID ${ctx.params.id} doesn't exist`);
        }
        await rapidReviews.removeAndFlush(rapid);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse schema: ${err}`);
      }

      // if deleted
      ctx.status = 204;
    },
  });

  return rapidRouter;
}
