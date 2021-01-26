import router from 'koa-joi-router';
import { getLogger } from '../log.js';
import { getErrorMessages } from '../utils/errors';
import getActivePersona from '../utils/persona.js';

const log = getLogger('backend:controller:comment');
const Joi = router.Joi;

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

const commentSchema = Joi.object({
  title: Joi.string().required(),
  contents: Joi.string().required(),
});

const handleInvalid = ctx => {
  log.debug('Validation error!');
  log.error('Error details ', ctx.invalid);
  ctx.status = 400;
  ctx.message = getErrorMessages(ctx.invalid);
};

// eslint-disable-next-line no-unused-vars
export default function controller(commentModel, fullReviewModel, thisUser) {
  const commentsRouter = router();

  // handler for GET multiple comments
  const getHandler = async ctx => {
    let comments, fid; // fid = fullReview ID

    ctx.params.fid ? (fid = ctx.params.fid) : null;

    try {
      if (fid) {
        log.debug(`Retrieving comments related to review ${fid}.`);
        comments = await commentModel.find({ parent: fid });
      } else {
        log.debug(`Retrieving all comments.`);
        comments = await commentModel.findAll();
      }
    } catch (err) {
      log.error('HTTP 400 error: ', err);
      ctx.throw(400, `Failed to retrieve comments`);
    }

    ctx.response.body = {
      status: 200,
      message: 'ok',
      data: comments,
    };
    ctx.status = 200;
  };

  const postHandler = async ctx => {
    if (ctx.invalid) {
      handleInvalid(ctx);
      return;
    }
    let fullReview, comment, fid, authorPersona;

    ctx.params.fid ? (fid = ctx.params.fid) : null;

    authorPersona = getActivePersona(ctx.state.user);

    try {
      if (fid) {
        fullReview = await fullReviewModel.findOne(fid);
      }

      log.debug('author', authorPersona);
      log.debug('fullReview', fullReview);
      log.debug('ctx.request.body', ctx.request.body);

      if (fullReview && authorPersona) {
        log.debug('creating a comment');
        comment = commentModel.create({
          ...ctx.request.body,
          parent: fullReview,
          author: authorPersona,
          isPublished: true,
        });
        fullReview.comments.add(comment);
      }
      await commentModel.persistAndFlush(comment);
    } catch (err) {
      log.error(`HTTP 400 error: ${err}`);
    }

    ctx.body = {
      status: 201,
      message: 'created',
    };

    ctx.status = 201;
  };

  commentsRouter.route({
    method: 'GET',
    path: '/comments',
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    validate: {
      query: querySchema,
    },
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }
      getHandler(ctx);
    },
    meta: {
      swagger: {
        operationId: 'GetComments',
        summary:
          'Endpoint to GET all comments on all full-length reviews of preprints.',
      },
    },
  });

  commentsRouter.route({
    method: 'GET',
    path: '/fullReviews/:fid/comments',
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    validate: {
      query: querySchema,
    },
    handler: async ctx => getHandler(ctx),
    meta: {
      swagger: {
        operationId: 'GetFullReviewComments',
        summary:
          'Endpoint to GET all comments related to a specific full-length review of a preprint.',
      },
    },
  });

  commentsRouter.route({
    method: 'POST',
    path: '/fullReviews/:fid/comments',
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    validate: {
      body: commentSchema,
      type: 'json',
      continueOnError: true,
    },
    handler: postHandler,
    meta: {
      swagger: {
        operationId: 'PostComments',
        summary:
          'Endpoint to POST comments on full-length reviews of preprints. Returns a 201 if a comment has been successfully created.',
      },
    },
  });

  commentsRouter.route({
    method: 'GET',
    path: '/comments/:id',
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    validate: {},
    handler: async ctx => {
      log.debug(`Retrieving comment ${ctx.params.id}.`);
      let comment;

      try {
        comment = await commentModel.findOne(ctx.params.id);

        if (!comment) {
          ctx.throw(404, `Comment with ID ${ctx.params.id} doesn't exist`);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse comment schema: ${err}`);
      }

      ctx.response.body = {
        status: 200,
        message: 'ok',
        data: [comment],
      };
      ctx.status = 200;
    },
    meta: {
      swagger: {
        operationId: 'GetComment',
        summary: 'Endpoint to GET a specific comment.',
        required: true,
      },
    },
  });

  commentsRouter.route({
    method: 'PUT',
    path: '/comments/:id',
    // pre: {},
    validate: {
      body: commentSchema,
      type: 'json',
      continueOnError: true,
    },
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }

      log.debug(`Updating comment ${ctx.params.id}.`);
      let comment;

      try {
        comment = await commentModel.findOne(ctx.params.id);

        if (!comment) {
          ctx.throw(404, `A comment with ID ${ctx.params.id} doesn't exist`);
        }

        commentModel.assign(comment, ctx.request.body);
        await commentModel.persistAndFlush(comment);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse comment schema: ${err}`);
      }

      // if updated
      ctx.status = 204;
    },
    meta: {
      swagger: {
        operationId: 'PutComment',
        summary: 'Endpoint to PUT changes on a specific comment.',
        require: true,
      },
    },
  });

  commentsRouter.route({
    method: 'DELETE',
    path: '/comments/:id',
    pre: (ctx, next) => thisUser.can('access admin pages')(ctx, next),
    // validate: {},
    handler: async ctx => {
      log.debug(`Removing comment with ID ${ctx.params.id}`);
      let comment;

      try {
        comment = await commentModel.findOne(ctx.params.id);

        if (!comment) {
          ctx.throw(404, `A comment with ID ${ctx.params.id} doesn't exist`);
        }

        await commentModel.removeAndFlush(comment);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse comment schema: ${err}`);
      }

      // if deleted
      ctx.status = 204;
    },
    meta: {
      swagger: {
        operationId: 'DeleteComment',
        summary: 'Endpoint to DELETE a comment.',
        required: true,
      },
    },
  });

  return commentsRouter;
}
