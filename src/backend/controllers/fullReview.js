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
    // pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    handler: async ctx => {
      log.debug('Adding full review.');
      let review, draft, authorPersona, preprint;

      try {
        review = reviewModel.create(ctx.request.body);
        await reviewModel.persistAndFlush(review);

        await review.authors.init();
        authorPersona = await personaModel.find(ctx.request.body.authors);
        review.authors.add(authorPersona[0]);

        preprint = await preprintModel.find(ctx.request.body.preprint);
        review.preprint = preprint[0];

        if (ctx.request.body.contents) {
          log.debug(`Adding full review draft.`);
          draft = draftModel.create({
            title: 'Review of a preprint', //TODO: remove when we make title optional
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
    meta: {
      swagger: {
        summary:
          'Endpoint to POST full-length drafts of reviews. The text contents of a review must be in the `contents` property of the request body. Returns a 201 if successful.',
      },
    },
  });

  reviewsRouter.route({
    method: 'GET',
    path: '/preprints/:pid/fullReviews',
    handler: async ctx => getHandler(ctx),
    meta: {
      swagger: {
        summary:
          'Endpoint to GET all full-length reviews of a specific preprint. If successful, returns a 200 and an array of reviews in the `data` property of the response body.',
      },
    },
  });

  reviewsRouter.route({
    method: 'GET',
    path: '/fullReviews',
    handler: async ctx => getHandler(ctx),
    meta: {
      swagger: {
        summary:
          'Endpoint to GET all full-length reviews. If successful, returns a 200 and an array of reviews in the `data` property of the response body.',
      },
    },
  });

  reviewsRouter.route({
    method: 'PUT',
    path: '/fullReviews/:id',
    handler: async ctx => {
      log.debug(`Updating review ${ctx.params.id}.`);
      let fullReview, draft;

      try {
        fullReview = await reviewModel.findOne(ctx.params.id);
        if (!fullReview) {
          ctx.throw(404, `Full review with ID ${ctx.params.id} doesn't exist`);
        }

        if (ctx.request.body.contents) {
          log.debug(`Adding full review draft.`);
          draft = draftModel.create({
            title: 'Review of a preprint', //TODO: remove when we make title optional
            contents: ctx.request.body.contents,
            parent: fullReview,
          });
          await draftModel.persistAndFlush(draft);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      // if updated
      ctx.status = 204;
    },
    meta: {
      swagger: {
        summary:
          'Endpoint to PUT updates to a specific full-length review. If successful, returns a 204.',
      },
    },
  });

  reviewsRouter.route({
    method: 'GET',
    path: '/fullReviews/:id',
    handler: async ctx => {
      log.debug(`Retrieving review ${ctx.params.id}.`);
      let fullReview, latestDraft;

      try {
        fullReview = await reviewModel.findOne(ctx.params.id, [
          'drafts',
          'authors',
        ]);

        if (!fullReview) {
          ctx.throw(404, `Full review with ID ${ctx.params.id} doesn't exist`);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (fullReview) {
        // gets latest draft associated with this review
        latestDraft = fullReview.drafts[fullReview.drafts.length - 1];

        ctx.body = {
          status: 200,
          message: 'ok',
          body: [{ ...fullReview, contents: latestDraft.contents }],
        };
        ctx.status = 200;
      }
    },
    meta: {
      swagger: {
        summary:
          "Endpoint to GET a specific full-length review. If successful, returns a 200 and a single-member array of the review object in the `data` property of the response body. The contents of the review's latest draft is in the `contents` property of the review object.",
      },
    },
  });

  reviewsRouter.route({
    method: 'DELETE',
    path: '/fullReviews/:id',
    pre: (ctx, next) => thisUser.can('access admin pages')(ctx, next),
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
    meta: {
      swagger: {
        summary:
          'Endpoint to DELETE full-length reviews of a specific preprint. Admin users only.',
      },
    },
  });

  return reviewsRouter;
}
