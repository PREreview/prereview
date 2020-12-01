import router from 'koa-joi-router';
import { getLogger } from '../log.js';
import { getErrorMessages } from '../utils/errors';

const log = getLogger('backend:controller:comment');
const Joi = router.Joi;

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
export default function controller(commentModel, thisUser) {
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

  commentsRouter.route({
    meta: {
      swagger: {
        summary:
          'Endpoint to POST comments on full-length reviews of preprints.',
      },
    },
    method: 'POST',
    path: '/comments',
    pre: async (ctx, next) => {
      await thisUser.can('access private pages');
      return next();
    },
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

      log.debug('Posting a comment.');
      let newComment;

      try {
        newComment = commentModel.create(ctx.request.body);
        await commentModel.persistAndFlush(newComment);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse comment schema: ${err}`);
      }

      ctx.body = {
        status: 201,
        message: 'created',
        data: [newComment],
      };
      ctx.status = 201;
    },
  });

  commentsRouter.route({
    meta: {
      swagger: {
        summary:
          'Endpoint to GET all comments on all full-length reviews of preprints.',
      },
    },
    method: 'GET',
    path: '/comments',
    pre: async (ctx, next) => {
      await thisUser.can('access private pages');
      return next();
    },
    // validate: {

    // },
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }
      getHandler(ctx);
    },
  });

  commentsRouter.route({
    meta: {
      swagger: {
        summary:
          'Endpoint to GET all comments related to a specific full-length review of a preprint.',
      },
    },
    method: 'GET',
    path: '/fullReviews/:fid/comments',
    // pre: {},
    // validate: {},
    handler: async ctx => getHandler(ctx),
  });

  commentsRouter.route({
    meta: {
      swagger: {
        summary: 'Endpoint to GET a single specific comment.',
      },
    },
    method: 'GET',
    path: '/comments/:id',
    // pre:thisUserthisUser.can('access private pages'),
    // validate: { },
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
  });

  commentsRouter.route({
    meta: {
      swagger: {
        summary: 'Endpoint to PUT changes on a specific comment.',
      },
    },
    method: 'put',
    path: '/comments/:id',
    // pre:thisUserthisUser.can('access private pages'),
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
  });

  commentsRouter.route({
    meta: {
      swagger: {
        summary: 'Endpoint to DELETE a comment.',
      },
    },
    method: 'delete',
    path: '/comments/:id',
    // pre: thisUser.can('');
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
  });

  return commentsRouter;
}
