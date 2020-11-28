import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:rapidReview');
// const Joi = router.Joi;

// eslint-disable-next-line no-unused-vars
export default function controller(rapidReviews, thisUser) {
  const rapidRouter = router();

  rapidRouter.route({
    method: 'post',
    path: '/rapidReviews',
    // pre: thisUser.can('access private pages'),
    // validate: {},
    handler: async ctx => {
      log.debug('Posting a rapid review.');
      let rapidReview;

      try {
        rapidReview = rapidReviews.create(ctx.request.body);
        await rapidReviews.persistAndFlush(rapidReview);
      } catch (error) {
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
    meta: {
      swagger: {
        summary: 'Endpoint to POST rapid reviews of a preprint',
      },
    },
  });

  rapidRouter.route({
    method: 'get',
    path: '/rapidReviews',
    // pre: thisUser.can('access private pages'),
    // validate: {},
    handler: async ctx => {
      log.debug('Retrieving rapid reviews.');
      let all, pid; // pid = preprint ID

      ctx.params.pid ? (pid = ctx.params.pid) : null;

      try {
        if (pid) {
          all = await rapidReviews.find({ preprint: pid });
        } else {
          all = await rapidReviews.findAll();
        }
      } catch (error) {
        return ctx.throw(400, { message: error.message });
      }

      ctx.response.body = { statusCode: 201, status: 'created', data: all };
      ctx.response.status = 201;
    },
  });

  rapidRouter.route({
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
        rapid = await rapidReviews.findOne(ctx.params.id, ['author', 'preprint']);
        if (!rapid) {
          ctx.throw(404, `Rapid review with ID ${ctx.params.id} doesn't exist`)
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: [rapid]
      }
    },
  });

  rapidRouter.route({
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
          ctx.throw(404, `Rapid review with ID ${ctx.params.id} doesn't exist`)
        }
        rapidReviews.assign(rapid, ctx.request.body)
        await rapidReviews.persistAndFlush(rapid)
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse schema: ${err}`);
      }

      // if updated
      ctx.status = 204;  
    },
  });

  rapidRouter.route({
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
          ctx.throw(404, `Rapid review with ID ${ctx.params.id} doesn't exist`)
        }
        await rapidReviews.removeAndFlush(rapid)
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
