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
    let allReviews, pid; // fid = fullReview ID

    if (ctx.params.pid) {
      pid = ctx.params.pid;
      log.debug(
        `Retrieving reviews associated with preprint ${ctx.params.pid}`,
      );
    } else {
      log.debug(`Retrieving all reviews.`);
    }

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
    meta: {
      swagger: {
        operationId: 'GetPreprintFullReviews',
        summary: 'Endpoint to GET full-length reviews of a specific preprint.',
        required: true,
      },
    },
    method: 'GET',
    path: '/preprints/:pid/fullReviews',
    // pre: thisUser.can('access private pages'),
    handler: async ctx => getHandler(ctx),
  });

  reviewsRouter.route({
    meta: {
      swagger: {
        operationId: 'GetFullReviews',
        summary: 'Endpoint to GET all full-length reviews.',
      },
    },
    method: 'GET',
    path: '/fullReviews',
    // pre: thisUser.can(''),
    handler: async ctx => getHandler(ctx),
  });

  reviewsRouter.route({
    meta: {
      swagger: {
        operationId: 'GetFullReview',
        summary: 'Endpoint to GET a specific full-length review.',
        required: true,
      },
    },
    method: 'GET',
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
    meta: {
      swagger: {
        operationId: 'DeleteFullReview',
        summary:
          'Endpoint to DELETE full-length reviews of a specific preprint. Admin users only.',
        required: true,
      },
    },
    method: 'DELETE',
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
