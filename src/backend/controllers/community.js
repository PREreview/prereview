import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controller:community');
const Joi = router.Joi;

export default function controller(communities, thisUser) {
  const communityRouter = router();

  communityRouter.route({
    method: 'post',
    path: '/communities',
    pre: thisUser.can('access admin pages'),
    validate: {
      body: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().unique(),
            description: Joi.string(),
          }),
        )
        .min(1),
      type: 'json',
      failure: 400,
    },
    handler: async ctx => {
      log.debug(`Adding a new community`);
      let community;

      try {
        community = communities.create(ctx.request.body.data);
        await communities.persistAndFlush(community);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse community schema: ${err}`);
      }

      ctx.response.body = {
        statusCode: 201,
        status: 'created',
        data: community,
      };
    },
  });

  return communityRouter;
}
