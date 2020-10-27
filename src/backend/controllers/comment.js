import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controller:comment');
const Joi = router.Joi;

export default function controller(comments) {
  const commentRouter = router();

  commentRouter.route({
    method: 'post',
    path: '/comments',
    // pre:thisUserthisUser.can('access private pages'),
    validate: {
      body: Joi.array()
        .items(
          Joi.object({
            title: Joi.string(),
            contents: Joi.string(),
          }),
        )
        .min(1),
      type: 'json',
      failure: 400,
    },
    handler: async ctx => {
      log.debug(`Posting a new comment.`);
      let comment, pid;

      if (ctx.params.pid) {
        pid = ctx.params.pid;
      }

      try {
        const comment = comments.create(ctx.request.body.data, pid);
        await comments.persistAndFlush(comment);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse comment schema: ${err}`);
      }

      ctx.body = {
        statusCode: 201,
        status: 'created',
        data: comment,
      };
    },
  });

  return commentRouter;
}
