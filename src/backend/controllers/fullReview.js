import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:fullReviews');
const Joi = router.Joi;

// eslint-disable-next-line no-unused-vars
const querySchema = Joi.object({
  start: Joi.number()
    .integer()
    .greater(-1),
  end: Joi.number()
    .integer()
    .positive(),
  asc: Joi.boolean(),
  sort_by: Joi.string(),
  from: Joi.string(),
  to: Joi.string(),
});

// eslint-disable-next-line no-unused-vars
export default function controller(reviewModel, thisUser) {
  const reviewsRouter = router();

  // handler for GET multiple reviews methods
  const getHandler = async ctx => {
    log.debug(`Retrieving full reviews.`);
    let pid, allReviews;

    ctx.params.pid ? (pid = ctx.params.pid) : null;

    try {
      if (pid) {
        allReviews = await reviewModel.find({ preprint: pid });
      } else {
        allReviews = await reviewModel.findAll();
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    ctx.body = {
      status: 200,
      message: 'ok',
      data: allReviews,
    };
    ctx.status = 200;
  };

  reviewsRouter.route({
    method: 'post',
    path: '/fullReviews',
    // pre: thisUser.can('access private pages'),
    // validate: {
    //   body: querySchema,
    //   type: 'json',
    //   failure: 400,
    //   // output: {
    //   //   201: {
    //   //     // could even be a code range!
    //   //     body: {},
    //   //   },
    //   // },
    // },
    handler: async ctx => {
      log.debug('Posting full review.');
      let review;

      try {
        review = reviewModel.create(ctx.request.body);
        await reviewModel.persistAndFlush(review);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse full review schema: ${err}`);
      }

      ctx.body = {
        status: 201,
        message: 'created',
        data: review,
      };
      ctx.status = 201;
    },
  });

  reviewsRouter.route({
    method: 'get',
    path: '/preprints/:pid/fullReviews',
    // pre: thisUser.can('access private pages'),
    handler: async ctx => getHandler(ctx),
  });

  reviewsRouter.route({
    method: 'get',
    path: '/fullReviews',
    // pre: thisUser.can(''),
    handler: async ctx => getHandler(ctx),
  });

  reviewsRouter.route({
    method: 'get',
    path: '/fullReviews/:id',
    handler: async ctx => {
      log.debug(`Retrieving review ${ctx.params.id}.`);
      let fullReview;

      try {
        fullReview = await reviewModel.findOne(ctx.params.id);
        if (!fullReview) {
          ctx.throw(404, `Full review with ID ${ctx.params.id} doesn't exist`);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: [fullReview],
      };
      ctx.status = 200;
    },
  });

  reviewsRouter.route({
    method: 'put',
    path: '/fullReviews/:id',
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Updating review ${ctx.params.id}.`);
      let fullReview;

      try {
        fullReview = await reviewModel.findOne(ctx.params.id);
        if (!fullReview) {
          ctx.throw(404, `Full review with ID ${ctx.params.id} doesn't exist`);
        }
        reviewModel.assign(fullReview, ctx.request.body);
        await reviewModel.persistAndFlush(fullReview);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      // if updated
      ctx.status = 204;
    },
  });

  reviewsRouter.route({
    method: 'delete',
    path: '/fullReviews/:id',
    // pre:thisUserthisUser.can('access admin pages'),
    handler: async ctx => {
      log.debug(`Deleting fullReview ${ctx.params.id}.`);
      let fullReview;

      try {
        fullReview = await reviewModel.findOne(ctx.params.id);
        if (!fullReview) {
          ctx.throw(404, `Full review with ID ${ctx.params.id} doesn't exist`);
        }
        await reviewModel.removeAndFlush(fullReview);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      // if deleted
      ctx.status = 204;
    },
  });

  return reviewsRouter;
}
