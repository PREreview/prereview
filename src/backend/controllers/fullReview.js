import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:fullReviews');
const Joi = router.Joi;

// const querySchema = Joi.object({
//   start: Joi.number()
//     .integer()
//     .greater(-1),
//   end: Joi.number()
//     .integer()
//     .positive(),
//   asc: Joi.boolean(),
//   sort_by: Joi.string(),
//   from: Joi.string(),
//   to: Joi.string(),
// });

// eslint-disable-next-line no-unused-vars
export default function controller(fullReviews, thisUser) {
  const fullReviewsRouter = router();

  fullReviewsRouter.route({
    method: 'post',
    path: '/fullReviews',
    // pre:thisUserthisUser.can('access private pages'),
    validate: {
      body: {
        preprint: Joi.number().integer(),
        authors: Joi.array(),
      },
      type: 'json',
      failure: 400,
      // output: {
      //   201: {
      //     // could even be a code range!
      //     body: {},
      //   },
      // },
    },
    handler: async ctx => {
      log.debug('Posting full review draft.');

      try {
        const fullReview = fullReviews.create(ctx.request.body);
        await fullReviews.persistAndFlush(fullReview);
      } catch (error) {
        return ctx.throw(400, { message: error.message });
      }

      ctx.response.status = 201;
    },
  });

  fullReviewsRouter.route({
    method: 'get',
    path: '/fullReviews',
    // pre: thisUser.can('access private pages'),
    handler: async ctx => {
      log.debug(`Retrieving fullReviews.`);

      try {
        const all = await fullReviews.findAll();
        if (all) {
          ctx.response.body = {
            statusCode: 200,
            status: 'ok',
            data: all,
          };
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }
    },
  });

  fullReviewsRouter.route({
    method: 'get',
    path: '/fullReviews/:id',
    handler: async ctx => {
      log.debug(`Retrieving fullReviews ${ctx.params.id}.`);
      let fullReview;

      try {
        fullReview = await fullReviews.findOne(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (fullReview.length) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: fullReview };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That preprint with ID ${
            ctx.params.id
          } does not exist.`,
        );
        ctx.throw(
          404,
          `That preprint with ID ${ctx.params.id} does not exist.`,
        );
      }
    },
  });

  fullReviewsRouter.route({
    method: 'put',
    path: '/fullReviews/:id',
    // pre:thisUserthisUser.can('access admin pages'),
    validate: {
      body: {
        doi: Joi.string().required(),
        authors: Joi.array(),
        is_hidden: Joi.boolean(),
        content: Joi.array(),
      },
      type: 'json',
      failure: 400,
    },
    handler: async ctx => {
      log.debug(`Updating fullReviews ${ctx.params.id}.`);
      let fullReview;

      try {
        fullReview = fullReviews.assign(ctx.params.id, ctx.request.body);

        fullReview.persistAndFlush(fullReviews);

        // workaround for sqlite
        if (Number.isInteger(fullReviews)) {
          fullReviews = await fullReviews.findOne(ctx.params.id);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }
    },
  });

  fullReviewsRouter.route({
    method: 'delete',
    path: '/fullReviews/:id',
    // pre:thisUserthisUser.can('access admin pages'),
    handler: async ctx => {
      log.debug(`Deleting fullReview ${ctx.params.id}.`);
      let fullReview;

      try {
        fullReview = fullReviews.findOne(ctx.params.id);
        await fullReview.removeAndFlush(fullReviews);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (fullReviews.length && fullReviews.length > 0) {
        ctx.response.body = { status: 'success', data: fullReview };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That fullReview with ID ${
            ctx.params.id
          } does not exist.`,
        );
        ctx.throw(
          404,
          `That fullReviews with ID ${ctx.params.id} does not exist.`,
        );
      }
    },
  });

  return fullReviewsRouter;
}
