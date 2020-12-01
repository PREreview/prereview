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

export default function controller(
  reviewModel,
  draftModel,
  personaModel,
  preprintModel,
  // eslint-disable-next-line no-unused-vars
  thisUser,
) {
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
        allReviews = await reviewModel.find({ preprint: pid }, [
          'authors',
          'comments',
        ]);
      } else {
        allReviews = await reviewModel.findAll(['authors', 'comments']);
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
    method: 'POST',
    path: '/fullReviews',
    handler: async ctx => {
      log.debug('Posting full review.');
      let review, draft, authorPersona, preprint;

      log.debug('ctx.request.body', ctx.request.body);

      try {
        review = reviewModel.create(ctx.request.body);
        await reviewModel.persistAndFlush(review);
        await review.authors.init();

        authorPersona = await personaModel.find(ctx.request.body.authors);
        preprint = await preprintModel.find(ctx.request.body.preprint);

        review.authors.add(authorPersona[0]);
        review.preprint = preprint[0];

        if (ctx.request.body.contents) {
          draft = draftModel.create({
            title: 'Review of a preprint',
            contents: ctx.request.body.contents,
            parent: review,
          });
          await draftModel.persistAndFlush(draft);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse full review schema: ${err}`);
      }

      ctx.body = {
        status: 201,
        message: 'created',
      };
      ctx.status = 201;
    },
  });

  reviewsRouter.route({
    meta: {
      swagger: {
        summary: 'Endpoint to GET full-length reviews of a specific preprint.',
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
        summary: 'Endpoint to GET a specific full-length review.',
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
        summary:
          'Endpoint to DELETE full-length reviews of a specific preprint. Admin users only.',
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
