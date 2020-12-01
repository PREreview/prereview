import router from 'koa-joi-router';
import { getLogger } from '../log.js';
import { getErrorMessages } from '../utils/errors';

const log = getLogger('backend:controller:community');
const Joi = router.Joi;

const communitySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  logo: Joi.string().uri(),
});

const handleInvalid = ctx => {
  log.debug('Validation error!');
  log.error(ctx.invalid);
  ctx.status = 400;
  ctx.message = getErrorMessages(ctx.invalid);
};

// eslint-disable-next-line no-unused-vars
export default function controller(communityModel, thisUser) {
  const communities = router();

  communities.route({
    meta: {
      swagger: {
        summary:
          'Endpoint to POST a new community to PREreview. Admin users only.',
      },
    },
    method: 'POST',
    path: '/communities',
    // pre:thisUserthisUser.can('access admin pages'),
    validate: {
      body: communitySchema,
      type: 'json',
      continueOnError: true,
    },
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }

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
    meta: {
      swagger: {
        summary:
          'Endpoint to GET all the communities registered on PREreview, as well as their associated members and preprints.',
      },
    },
    method: 'GET',
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
    meta: {
      swagger: {
        summary:
          'Endpoint to GET info on one community registered on PREreview, along with its associated members and preprints.',
      },
    },
    method: 'GET',
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
    meta: {
      swagger: {
        summary:
          'Endpoint to PUT updates on a community registered on PREreview. Admin users only.',
      },
    },
    method: 'put',
    path: '/communities/:id',
    // pre: thisUser.can(''),
    validate: {
      body: communitySchema,
      type: 'json',
      continueOnError: true,
    },
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }

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
    meta: {
      swagger: {
        summary: 'Endpoint to DELETE a community. Admin users only.',
      },
    },
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
