import router from 'koa-joi-router';
import { getLogger } from '../log.js';
import getActivePersona from '../utils/persona.js';

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
        allReviews = await reviewModel.findAll({ preprint: pid }, [
          'authors',
          'comments',
          'drafts',
        ]);
      } else {
        allReviews = await reviewModel.findAll([
          'authors',
          'comments',
          'drafts',
        ]);
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

  const postHandler = async ctx => {
    log.debug('Adding full review.');
    let review, draft, authorPersona, preprint;

    try {
      authorPersona = getActivePersona(ctx.state.user);
    } catch (err) {
      log.error('Failed to load user personas.');
      ctx.throw(400, err);
    }

    try {
      preprint = await preprintModel.findOne(ctx.request.body.preprint);
      review = reviewModel.create({
        ...ctx.request.body,
        preprint: preprint,
      });

      review.authors.add(authorPersona);

      if (ctx.request.body.contents) {
        log.debug(`Adding full review draft.`);
        draft = draftModel.create({
          title: 'Review of a preprint', //TODO: remove when we make title optional
          contents: ctx.request.body.contents,
          parent: review,
        });
        review.drafts.add(draft);
      }
      await reviewModel.persistAndFlush(review);
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse full review schema: ${err}`);
    }

    ctx.body = {
      status: 201,
      message: 'created',
      body: review,
    };
    ctx.status = 201;
  };

  reviewsRouter.route({
    method: 'POST',
    path: '/fullReviews',
    // pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    handler: postHandler,
    meta: {
      swagger: {
        operationId: 'PostFullReviews',
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
        operationId: 'GetPreprintFullReviews',
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
        operationId: 'GetFullReviews',
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
        fullReview = await reviewModel.findOne({ uuid: ctx.params.id });
        if (!fullReview) {
          try {
            postHandler();
          } catch {
            ctx.throw(
              404,
              `Full review with ID ${ctx.params.id} doesn't exist and`,
            );
          }
        }

        if (ctx.request.body.contents) {
          log.debug(`Adding full review draft.`);
          draft = draftModel.create({
            title: 'Review of a preprint', //TODO: remove when we make title optional
            contents: ctx.request.body.contents,
            parent: fullReview,
          });
          await draftModel.persistAndFlush(draft);
          fullReview.drafts.add(draft);
        }
        // reviewModel.assign(fullReview, ctx.request.body);
        await reviewModel.persistAndFlush(fullReview);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      // if updated
      ctx.status = 204;
    },
    meta: {
      swagger: {
        operationId: 'PutFullReview',
        summary:
          'Endpoint to PUT updates to a specific full-length review. If successful, returns a 204.',
      },
    },
  });

  reviewsRouter.route({
    method: 'PUT',
    path: '/fullReviews/:id/invitees/:pid',
    validate: {
      params: {
        id: Joi.number()
          .integer()
          .description('Full Review id')
          .required(),
        pid: Joi.alternatives()
          .try(Joi.number().integer(), Joi.string())
          .description('Persona id')
          .required(),
      },
    },
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    handler: async ctx => {
      log.debug(`Adding persona ${ctx.params.pid} to review ${ctx.params.id}.`);
      let review, persona;

      try {
        review = await reviewModel.findOne(ctx.params.id, ['invitees']);
        persona = await personaModel.findOne(ctx.params.pid);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (review && persona) {
        try {
          log.debug(
            `Full review ${review.id} found. Inviting persona ${
              persona.id
            } to review.`,
          );
          review.invitees.add(persona);
          await reviewModel.persistAndFlush(review);
        } catch (err) {
          log.error('HTTP 400 Error: ', err);
          ctx.throw(400, `Failed to add persona to review: ${err}`);
        }

        ctx.status = 204;
      } else {
        log.error('HTTP 404: Review or Persona not found');
        ctx.throw(404, 'Review or Persona not found');
      }

      ctx.body = { status: 201, message: 'created', data: review };
      ctx.status = 201;
    },
    meta: {
      swagger: {
        operationId: 'PutFullReviewInvitee',
        summary:
          'Endpoint to PUT one persona an invite to a review by ID from PREreview.',
        required: true,
      },
    },
  });

  reviewsRouter.route({
    method: 'DELETE',
    path: '/fullReviews/:id/invitees/:pid',
    validate: {
      params: {
        id: Joi.number()
          .integer()
          .description('Full Review id')
          .required(),
        pid: Joi.alternatives()
          .try(Joi.number().integer(), Joi.string())
          .description('Persona id')
          .required(),
      },
    },
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    handler: async ctx => {
      log.debug(
        `Removing persona ${ctx.params.pid} from review ${ctx.params.id}.`,
      );
      let review, persona;

      try {
        review = await reviewModel.findOne(ctx.params.id, ['invitees']);
        persona = await personaModel.findOne(ctx.params.pid);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (review && persona) {
        try {
          log.debug(
            `Full review ${review.id} found. Disinviting persona ${
              persona.id
            } from review.`,
          );
          review.invitees.remove(persona);
          await reviewModel.persistAndFlush(review);
        } catch (err) {
          log.error('HTTP 400 Error: ', err);
          ctx.throw(400, `Failed to remove persona from review: ${err}`);
        }
      } else {
        log.error('HTTP 404: Review or Persona not found');
        ctx.throw(404, 'Review or Persona not found');
      }

      ctx.body = { status: 200, message: 'ok', data: review };
      ctx.status = 200;
    },
    meta: {
      swagger: {
        operationId: 'DeleteFullReviewInvitee',
        summary:
          'Endpoint to DELETE one persona from an invite by ID from PREreview.',
        required: true,
      },
    },
  });

  reviewsRouter.route({
    method: 'POST',
    path: '/fullReviews/:id/invitees/:pid/accept',
    validate: {
      params: {
        id: Joi.number()
          .integer()
          .description('Full Review id')
          .required(),
        pid: Joi.alternatives()
          .try(Joi.number().integer(), Joi.string())
          .description('Persona id')
          .required(),
      },
    },
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    handler: async ctx => {
      log.debug(`Adding persona ${ctx.params.pid} to review ${ctx.params.id}.`);
      let review, persona;

      try {
        review = await reviewModel.findOne(ctx.params.id, [
          'invitees',
          'authors',
        ]);
        persona = await personaModel.findOne(ctx.params.pid);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (!review || !persona) {
        log.error('HTTP 404: Review or Persona not found');
        ctx.throw(404, 'Review or Persona not found');
      }

      if (review.invitees.contains(persona)) {
        try {
          log.debug(
            `Accepting invitation on behalf of ${persona.id} to edit review ${
              review.id
            }.`,
          );
          review.invitees.remove(persona);
          review.authors.add(persona);
          await reviewModel.persistAndFlush(review);
        } catch (err) {
          log.error('HTTP 400 Error: ', err);
          ctx.throw(400, `Failed to add persona to review authors: ${err}`);
        }

        ctx.status = 204;
      } else {
        log.error('HTTP 404: Review or Persona not found');
        ctx.throw(404, 'Review or Persona not found');
      }

      ctx.body = { status: 201, message: 'created', data: review };
      ctx.status = 201;
    },
    meta: {
      swagger: {
        operationId: 'PostFullReviewInviteeAccept',
        summary:
          'Endpoint to POST to accept one invite to collaborate on a FullReview.',
        required: true,
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
        fullReview = await reviewModel.findOne({ uuid: ctx.params.id }, [
          'drafts',
          'authors',
          'comments',
          'mentors',
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
        fullReview.drafts.length
          ? (latestDraft = fullReview.drafts[fullReview.drafts.length - 1])
          : null;
        latestDraft
          ? (fullReview = { ...fullReview, contents: latestDraft.contents })
          : null;

        ctx.body = {
          status: 200,
          message: 'ok',
          body: [fullReview],
        };
        ctx.status = 200;
      }
    },
    meta: {
      swagger: {
        operationId: 'GetFullReview',
        summary:
          "Endpoint to GET a specific full-length review. If successful, returns a 200 and a single-member array of the review object in the `data` property of the response body. The contents of the review's latest draft is in the `contents` property of the review object.",
        required: true,
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
        fullReview = await reviewModel.findOne({ uuid: ctx.params.id });
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
        operationId: 'DeleteFullReview',
        summary:
          'Endpoint to DELETE full-length reviews of a specific preprint. Admin users only.',
        required: true,
      },
    },
  });

  return reviewsRouter;
}
