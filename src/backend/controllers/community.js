import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controller:community');
// eslint-disable-next-line no-unused-vars
const Joi = router.Joi;

// eslint-disable-next-line no-unused-vars
export default function controller(communityModel, thisUser) {
  const communities = router();

  communities.route({
    method: 'post',
    path: '/communities',
    // pre:thisUserthisUser.can('access admin pages'),
    // validate: {},
    handler: async ctx => {
      log.debug(`Adding a new community`);
      let community;

      try {
        community = communityModel.create(ctx.request.body);
        await communityModel.persistAndFlush(community);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse community schema: ${err}`);
      }

      ctx.body = {
        status: 201,
        message: 'created',
        data: [community],
      };
      ctx.status = 201;
    },
  });

  communities.route({
    method: 'get',
    path: '/communities',
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving communities.`);
      let allCommunities;

      try {
        allCommunities = await communityModel.findAll(['members', 'preprints']);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse community schema: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: allCommunities,
      };
      ctx.status = 200;
    },
  });

  communities.route({
    method: 'get',
    path: '/communities/:id',
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving community with id ${ctx.params.id}.`);
      let community;

      try {
        community = await communityModel.findOne(ctx.params.id, [
          'members',
          'preprints',
        ]);
        if (!community) {
          ctx.throw(404, `Community with ID ${ctx.params.id} doesn't exist`);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse community schema: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: [community],
      };
      ctx.status = 200;
    },
  });

  communities.route({
    method: 'put',
    path: '/communities/:id',
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Updating community with id ${ctx.params.id}.`);
      let community;

      try {
        community = await communityModel.findOne(ctx.params.id);
        if (!community) {
          ctx.throw(404, `Community with ID ${ctx.params.id} doesn't exist`);
        }
        communityModel.assign(community, ctx.request.body);
        await communityModel.persistAndFlush(community);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse community schema: ${err}`);
      }

      // if updated
      ctx.status = 204;
    },
  });

  communities.route({
    method: 'delete',
    path: '/communities/:id',
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving community with id ${ctx.params.id}.`);
      let community;

      try {
        community = await communityModel.findOne(ctx.params.id);
        if (!community) {
          ctx.throw(404, `Community with ID ${ctx.params.id} doesn't exist`);
        }
        await communityModel.removeAndFlush(community);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse community schema: ${err}`);
      }

      // if deleted
      ctx.status = 204;
    },
  });

  return communities;
}
