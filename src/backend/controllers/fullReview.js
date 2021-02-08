import router from 'koa-joi-router';
import { getLogger } from '../log.js';
import generateDOI from '../utils/generateDOI.js';
import getActivePersona from '../utils/persona.js';

const log = getLogger('backend:controllers:fullReviews');
const Joi = router.Joi;

// eslint-disable-next-line no-unused-vars
const querySchema = Joi.object({
  is_published: Joi.boolean(),
  can_edit: Joi.string(),
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
      const queries = [];
      if (
        ctx.query.is_published !== undefined &&
        ctx.query.is_published !== null
      ) {
        queries.push({ isPublished: { $eq: ctx.query.is_published } });
      }

      if (ctx.query.can_edit) {
        const editors = decodeURIComponent(ctx.query.can_edit).split(',');
        queries.push({
          $or: [
            { authors: { uuid: { $in: editors } } },
            { mentors: { uuid: { $in: editors } } },
          ],
        });
      }

      if (pid) {
        queries.push({ preprint: { uuid: { $eq: pid } } });
      }

      if (queries.length > 0) {
        let query;
        if (queries.length > 1) {
          query = { $and: queries };
        } else {
          query = queries[0];
        }
        log.debug('Querying preprints:', query);
        allReviews = await reviewModel.find(query, [
          'authors',
          'comments',
          'drafts',
          'preprint',
        ]);
      } else {
        allReviews = await reviewModel.findAll([
          'authors',
          'comments',
          'drafts',
          'preprint',
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
    const creators = [];

    try {
      preprint = await preprintModel.findOneByUuidOrHandle(
        ctx.request.body.preprint,
      );
      review = reviewModel.create({
        ...ctx.request.body,
        preprint: preprint,
      });

      if (ctx.request.body.authors) {
        for (let p of ctx.request.body.authors) {
          authorPersona = await personaModel.findOne({ uuid: p.uuid });
          if (authorPersona) {
            creators.push({
              name: authorPersona.isAnonymous
                ? `PREreview community member`
                : authorPersona.name,
              orcid: authorPersona.isAnonymous
                ? ''
                : authorPersona.identity.orcid,
            });
            review.authors.add(authorPersona);
          }
        }
      } else {
        authorPersona = await personaModel.findOne(ctx.state.user.defaultPersona);
        creators.push({
          name: authorPersona.isAnonymous
            ? `PREreview community member`
            : authorPersona.name,
          orcid: authorPersona.isAnonymous ? '' : ctx.state.user.orcid,
        });
        review.authors.add(authorPersona);
      }

      if (ctx.request.body.contents) {
        log.debug(`Adding full review draft.`);
        draft = draftModel.create({
          title: 'Review of a preprint', //TODO: remove when we make title optional
          contents: ctx.request.body.contents,
          parent: review,
        });
        review.drafts.add(draft);
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse full review schema: ${err}`);
    }

    let reviewData;

    if (review.isPublished) {
      reviewData = {
        title: review.title || `Review of ${preprint.title}`,
        content: draft.contents,
        // ensuring anonymous reviewers stay anonymous
        creators: creators,
      };
      try {
        // yay, the review gets a DOI!
        review.doi = await generateDOI(reviewData);
      } catch (err) {
        log.error(`Error generating DOI from Zenodo. ${err}`);
        ctx.throw(400, `Failed to generate DOI.`);
      }
    }

    try {
      console.log('***review***:', review);
      await reviewModel.persistAndFlush(review);
    } catch (err) {
      log.error(`HTTP 400 error: ${err}`);
      ctx.throw(400, `Failed to persist review.`);
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
    validate: {
      query: querySchema,
    },
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
            postHandler(ctx);
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
    method: 'POST',
    path: '/fullReviews/:id/:role',
    validate: {
      params: {
        id: Joi.string()
          .description('Full Review id')
          .required(),
        role: Joi.string()
          .description('Role')
          .required(),
      },
      body: Joi.object({
        pid: Joi.string()
          .description('Persona id')
          .required(),
      }),
      type: 'json',
    },
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    handler: async ctx => {
      log.debug(
        `Adding persona ${ctx.request.body.pid} to review ${ctx.params.id
        } with role ${ctx.params.role}.`,
      );
      let review, persona;

      try {
        if (ctx.params.role === 'authors') {
          review = await reviewModel.findOne({ uuid: ctx.params.id }, [
            'preprint',
            'authorInvites',
          ]);
        } else if (ctx.params.role === 'mentors') {
          review = await reviewModel.findOne({ uuid: ctx.params.id }, [
            'preprint',
            'mentorInvites',
          ]);
        }
        persona = await personaModel.findOne({ uuid: ctx.request.body.pid }, [
          'identity.contacts',
        ]);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      console.log('***review***:', review);
      console.log('***persona***:', persona);
      if (!review || !persona) {
        log.error('HTTP 400: Invalid review or Persona');
        ctx.throw(400, 'Invalid Review or Persona');
      }

      if (ctx.params.role === 'authors') {
        try {
          log.debug(
            `Full review ${review.id} found. Inviting persona ${persona.id
            } to review.`,
          );
          review.authorInvites.add(persona);
          await reviewModel.persistAndFlush(review);
          for (let contact of persona.identity.contacts) {
            if (
              contact.schema === 'mailto' &&
              contact.value &&
              contact.isNotified
            ) {
              await ctx.mail.send({
                template: 'inviteAuthor',
                message: {
                  to: contact.value,
                },
                locals: {
                  title: review.preprint.title,
                },
              });
              log.info(
                `Sent author invitation email to ${contact.value} for review ${review.uuid
                }`,
              );
            }
          }
        } catch (err) {
          log.error('HTTP 400 Error: ', err);
          ctx.throw(400, `Failed to add persona to review: ${err}`);
        }

        ctx.status = 204;
        return;
      } else if (ctx.params.role === 'mentors') {
        try {
          log.debug(
            `Full review ${review.id} found. Inviting persona ${persona.id
            } to review.`,
          );
          review.mentorInvites.add(persona);
          await reviewModel.persistAndFlush(review);
          for (let contact of persona.identity.contacts) {
            if (
              contact.schema === 'mailto' &&
              contact.value &&
              contact.isNotified
            ) {
              await ctx.mail.send({
                template: 'inviteMentor',
                message: {
                  to: contact.value,
                },
                locals: {
                  title: review.preprint.title,
                },
              });
              log.info(
                `Sent mentor invitation email to ${contact.value} for review ${review.uuid
                }`,
              );
            }
          }
        } catch (err) {
          log.error('HTTP 400 Error: ', err);
          ctx.throw(400, `Failed to add persona to review: ${err}`);
        }

        ctx.status = 204;
        return;
      } else {
        log.error('HTTP 400: Invalid invite');
        ctx.throw(400, 'Invalid invite');
      }
    },
    meta: {
      swagger: {
        operationId: 'PostFullReviewInvite',
        summary:
          'Endpoint to PUT one persona an invite to a review by ID from PREreview.',
        required: true,
      },
    },
  });

  reviewsRouter.route({
    method: 'DELETE',
    path: '/fullReviews/:id/:role',
    validate: {
      params: {
        id: Joi.string()
          .description('Full Review id')
          .required(),
        role: Joi.string()
          .description('Role')
          .required(),
      },
      body: {
        pid: Joi.string()
          .description('Persona id')
          .required(),
      },
      type: 'json',
    },
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    handler: async ctx => {
      log.debug(
        `Removing persona ${ctx.params.pid} from review ${ctx.params.id}.`,
      );
      let review, persona;

      try {
        if (ctx.params.role === 'authors') {
          review = await reviewModel.findOne({ uuid: ctx.params.id }, [
            'authorInvites',
          ]);
        } else if (ctx.params.role === 'mentors') {
          review = await reviewModel.findOne({ uuid: ctx.params.id }, [
            'mentorInvites',
          ]);
        }
        persona = await personaModel.findOne({ uuid: ctx.request.body.pid });
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (!review || !persona) {
        log.error('HTTP 404: Review or Persona not found');
        ctx.throw(404, 'Review or Persona not found');
      }

      if (
        ctx.params.role === 'authors' &&
        review.authorInvites.contains(persona)
      ) {
        try {
          log.debug(
            `Full review ${review.id} found. Inviting persona ${persona.id
            } to review.`,
          );
          review.authorInvites.remove(persona);
          await reviewModel.persistAndFlush(review);
        } catch (err) {
          log.error('HTTP 400 Error: ', err);
          ctx.throw(400, `Failed to add persona to review: ${err}`);
        }

        ctx.status = 204;
        return;
      } else if (
        ctx.params.role === 'mentors' &&
        review.mentorInvites.contains(persona)
      ) {
        try {
          log.debug(
            `Full review ${review.id} found. Inviting persona ${persona.id
            } to review.`,
          );
          review.mentorInvites.remove(persona);
          await reviewModel.persistAndFlush(review);
        } catch (err) {
          log.error('HTTP 400 Error: ', err);
          ctx.throw(400, `Failed to add persona to review: ${err}`);
        }

        ctx.status = 204;
        return;
      } else {
        log.error('HTTP 404: Invite not found');
        ctx.throw(404, 'Invite not found');
      }
    },
    meta: {
      swagger: {
        operationId: 'DeleteFullReviewInvite',
        summary:
          'Endpoint to DELETE one persona from an invite by ID from PREreview.',
        required: true,
      },
    },
  });

  reviewsRouter.route({
    method: 'POST',
    path: '/fullReviews/:id/:role/:pid',
    validate: {
      params: {
        id: Joi.string()
          .description('Full Review id')
          .required(),
        role: Joi.string()
          .description('Role')
          .required(),
        pid: Joi.string()
          .description('Persona id')
          .required(),
      },
    },
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    handler: async ctx => {
      log.debug(
        `Adding persona ${ctx.params.pid} to review ${ctx.params.id} as a(n) ${ctx.params.role
        }.`,
      );
      let review, persona;

      try {
        if (ctx.params.role === 'authors') {
          review = await reviewModel.findOne({ uuid: ctx.params.id }, [
            'authorInvites',
            'authors',
          ]);
        } else if (ctx.params.role === 'mentors') {
          review = await reviewModel.findOne({ uuid: ctx.params.id }, [
            'mentorInvites',
            'mentors',
          ]);
        }
        persona = await personaModel.findOne({ uuid: ctx.params.pid });
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }
      console.log('***review***:', review);
      console.log('***persona***:', persona);

      if (!review || !persona) {
        log.error('HTTP 404: Review or Persona not found');
        ctx.throw(404, 'Review or Persona not found');
      }

      if (
        ctx.params.role === 'authors' &&
        review.authorInvites.contains(persona)
      ) {
        try {
          log.debug(
            `Full review ${review.id} found. Inviting persona ${persona.id
            } to review.`,
          );
          review.authorInvites.remove(persona);
          review.authors.add(persona);
          await reviewModel.persistAndFlush(review);
        } catch (err) {
          log.error('HTTP 400 Error: ', err);
          ctx.throw(400, `Failed to add persona to review: ${err}`);
        }

        ctx.status = 204;
        return;
      } else if (
        ctx.params.role === 'mentors' &&
        review.mentorInvites.contains(persona)
      ) {
        try {
          log.debug(
            `Full review ${review.id} found. Inviting persona ${persona.id
            } to review.`,
          );
          review.mentorInvites.remove(persona);
          review.mentors.add(persona);
          await reviewModel.persistAndFlush(review);
        } catch (err) {
          log.error('HTTP 400 Error: ', err);
          ctx.throw(400, `Failed to add persona to review: ${err}`);
        }

        ctx.status = 204;
        return;
      } else {
        log.error('HTTP 404: Invite not found');
        ctx.throw(404, 'Invite not found');
      }
    },
    meta: {
      swagger: {
        operationId: 'PostFullReviewInviteAccept',
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
