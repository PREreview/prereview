import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:rapidReviews');
// const Joi = router.Joi;

export default function controller(rapidReviews) {
  //thisUser
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
        return ctx.throw(400, { message: error.message });
      }

      ctx.response.body = {
        statusCode: 201,
        status: 'created',
        data: rapidReview,
      };
      ctx.response.status = 201;
    },
  });

  rapidRouter.route({
    method: 'get',
    path: '/rapidReviews',
    // pre: thisUser.can('access private pages'),
    // validate: {},
    handler: async ctx => {
      log.debug('Retrieving rapid reviews.');
      let all, pid;

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
        rapid = await rapidReviews.findOne(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (rapid) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: rapid };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That rapid review with ID ${
            ctx.params.id
          } does not exist.`,
        );

        ctx.response.status = 404;

        ctx.body = {
          statusCode: 404,
          status: `HTTP 404 Error.`,
          message: `That rapid review with ID ${ctx.params.id} does not exist.`,
        };
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

      log.debug(`Retrieving rapid review ${ctx.params.id}`);
      let rapid;

      try {
        rapid = await rapidReviews.findOne(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (rapid) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: rapid };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That rapid review with ID ${
            ctx.params.id
          } does not exist.`,
        );

        ctx.response.status = 404;

        ctx.body = {
          statusCode: 404,
          status: `HTTP 404 Error.`,
          message: `That rapid review with ID ${ctx.params.id} does not exist.`,
        };
      }
    },
  });

  return rapidRouter;
}
