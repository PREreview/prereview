import router from 'koa-joi-router';
import { QueryOrder, wrap } from '@mikro-orm/core';
import { PostgreSqlConnection } from '@mikro-orm/postgresql';
import { getLogger } from '../log.js';
import { getErrorMessages } from '../utils/errors';

const log = getLogger('backend:controller:community');
const Joi = router.Joi;

const communitySchema = Joi.object({
  name: Joi.string(),
  slug: Joi.string(),
  description: Joi.string(),
  banner: Joi.string(),
  twitter: Joi.string().regex(/^[a-zA-Z0-9_]{1,15}$/),
});

const tagSchema = Joi.object({
  name: Joi.string(),
  color: Joi.string(),
});

const querySchema = Joi.object({
  limit: Joi.number()
    .integer()
    .greater(-1),
  offset: Joi.number()
    .integer()
    .greater(-1),
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
  tags: Joi.string().allow(''),
  search: Joi.string().allow(''),
});

const handleInvalid = ctx => {
  log.debug('Validation error!');
  log.error(ctx.invalid);
  ctx.status = 400;
  ctx.message = getErrorMessages(ctx.invalid);
};

// eslint-disable-next-line no-unused-vars
export default function controller(
  communityModel,
  userModel,
  personaModel,
  eventModel,
  tagModel,
  thisUser,
) {
  const communities = router();

  communities.route({
    method: 'POST',
    path: '/communities',
    pre: thisUser.can('access admin pages'),
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
    meta: {
      swagger: {
        operationId: 'PostCommunities',
        summary:
          'Endpoint to POST a new community to PREreview. Admin users only.',
      },
    },
  });

  communities.route({
    method: 'GET',
    path: '/communities',
    validate: {
      query: querySchema,
      continueOnError: true,
    },
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }

      log.debug(`Retrieving communities.`);

      try {
        const populate = [
          'members',
          'preprints',
          'owners.defaultPersona',
          'tags',
          'events',
        ];
        let foundCommunities, count;
        const order = ctx.query.asc
          ? QueryOrder.ASC_NULLS_LAST
          : QueryOrder.DESC_NULLS_LAST;
        const orderBy = { name: order };
        const queries = [];
        if (ctx.query.search && ctx.query.search !== '') {
          const connection = communityModel.em.getConnection();
          if (connection instanceof PostgreSqlConnection) {
            queries.push({
              $or: [
                { name: { $ilike: `%${ctx.query.search}%` } },
                { description: { $ilike: `%${ctx.query.search}%` } },
                { members: { $ilike: `%${ctx.query.search}%` } },
                { owners: { $ilike: `%${ctx.query.search}%` } },
                { events: { $ilike: `%${ctx.query.search}%` } },
                { preprints: { $ilike: `%${ctx.query.search}%` } },
              ],
            });
          } else {
            queries.push({
              $or: [
                { name: { $like: `%${ctx.query.search}%` } },
                { description: { $like: `%${ctx.query.search}%` } },
                { members: { $like: `%${ctx.query.search}%` } },
                { owners: { $like: `%${ctx.query.search}%` } },
                { events: { $like: `%${ctx.query.search}%` } },
                { preprints: { $like: `%${ctx.query.search}%` } },
              ],
            });
          }
        }

        if (ctx.query.tags) {
          const tags = ctx.query.tags.split(',');
          queries.push({
            $or: [
              { tags: { uuid: { $in: tags } } },
              { tags: { name: { $in: tags } } },
            ],
          });
        }

        if (queries.length > 0) {
          let query;
          if (queries.length > 1) {
            query = { $and: queries };
          } else {
            query = queries[0];
          }
          log.debug('Querying communities:', query);
          [foundCommunities, count] = await communityModel.findAndCount(
            query,
            populate,
            orderBy,
            ctx.query.limit,
            ctx.query.offset,
          );
        } else {
          foundCommunities = await communityModel.findAll(
            populate,
            orderBy,
            ctx.query.limit,
            ctx.query.offset,
          );
          count = await communityModel.count();
        }

        foundCommunities = await Promise.all(
          foundCommunities.map(async community => {
            if (community.banner && Buffer.isBuffer(community.banner)) {
              community.banner = community.banner.toString();
            }
            community.owners = await community.owners
              .getItems()
              .reduce(async (acc, owner) => {
                acc = await acc;
                if (owner.defaultPersona) {
                  await wrap(owner.defaultPersona).init();
                  acc.push(owner.defaultPersona);
                }
                return acc;
              }, []);
            return community;
          }),
        );

        if (foundCommunities) {
          ctx.body = {
            statusCode: 200,
            status: 'ok',
            totalCount: count,
            data: foundCommunities,
          };
          ctx.status = 200;
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse community schema: ${err}`);
      }
    },
    meta: {
      swagger: {
        operationId: 'GetCommunities',
        summary:
          'Endpoint to GET all the communities registered on PREreview, as well as their associated members and preprints.',
      },
    },
  });

  communities.route({
    method: 'GET',
    path: '/communities/:id',
    validate: {
      query: querySchema,
      continueOnError: true,
    },
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }

      log.debug(`Retrieving community with id ${ctx.params.id}.`);
      let community;

      try {
        community = await communityModel.findOne(
          {
            $or: [{ uuid: ctx.params.id }, { slug: ctx.params.id }],
          },
          ['members', 'preprints', 'owners', 'tags', 'events', 'templates'],
        );
        if (!community) {
          ctx.throw(404, `Community with ID ${ctx.params.id} doesn't exist`);
        }
        if (community.banner && Buffer.isBuffer(community.banner)) {
          community.banner = community.banner.toString();
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse community schema: ${err}`);
      }

      if (community.banner && Buffer.isBuffer(community.banner)) {
        community.banner = community.banner.toString();
      }
      community.owners = await community.owners
        .getItems()
        .reduce(async (acc, owner) => {
          acc = await acc;
          if (owner.defaultPersona) {
            await wrap(owner.defaultPersona).init();
            acc.push(owner.defaultPersona);
          }
          return acc;
        }, []);

      ctx.body = {
        status: 200,
        message: 'ok',
        data: [community],
      };
      ctx.status = 200;
    },
    meta: {
      swagger: {
        operationId: 'GetCommunity',
        summary:
          'Endpoint to GET info on a community registered on PREreview, along with its associated members and preprints.',
      },
    },
  });

  communities.route({
    method: 'PUT',
    path: '/communities/:id',
    pre: thisUser.can('edit this community'),
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
        community = await communityModel.findOne({ uuid: ctx.params.id });
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
    meta: {
      swagger: {
        operationId: 'PutCommunity',
        summary:
          'Endpoint to PUT updates on a community registered on PREreview. Admin users only.',
      },
    },
  });

  communities.route({
    method: 'DELETE',
    path: '/communities/:id',
    pre: thisUser.can('access admin pages'),
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }

      log.debug(`Deleting community with id ${ctx.params.id}.`);
      let community;

      try {
        community = await communityModel.findOne({ uuid: ctx.params.id });
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
    meta: {
      swagger: {
        operationId: 'DeleteCommunity',
        summary: 'Endpoint to DELETE a community. Admin users only.',
      },
    },
  });

  communities.route({
    method: 'PUT',
    path: '/communities/:id/members/:uid',
    validate: {
      params: {
        id: Joi.string()
          .description('Community id')
          .required(),
        uid: Joi.string()
          .description('User id')
          .required(),
      },
    },
    pre: thisUser.can('edit this community'),
    handler: async ctx => {
      log.debug(`Adding user ${ctx.params.uid} to community ${ctx.params.id}.`);
      let community, user;

      try {
        community = await communityModel.findOne({ uuid: ctx.params.id });
        user = await personaModel.findOne({ uuid: ctx.params.uid });
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (!community || !user) {
        log.error('HTTP 404 Error: Community or user not found.');
        ctx.throw(404, 'Community or user not found.');
      }

      try {
        log.debug(
          `Community ${community.uuid} found. Adding user ${
            user.uuid
          } to community.`,
        );
        community.members.add(user);
        await communityModel.persistAndFlush(community);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to add user to community: ${err}`);
      }

      ctx.body = {
        status: 201,
        message: 'User has been added to community',
        data: user,
      };
      ctx.status = 201;
    },
    meta: {
      swagger: {
        operationId: 'PutCommunityMember',
        summary:
          'Endpoint to PUT one user to a community by ID from PREreview. Admin users only.',
        required: true,
      },
    },
  });

  communities.route({
    meta: {
      swagger: {
        operationId: 'DeleteCommunityMember',
        summary:
          'Endpoint to DELETE one user from a community by ID from PREreview. Admin users only.',
        required: true,
      },
    },
    method: 'DELETE',
    path: '/communities/:id/members',
    validate: {
      query: Joi.object({
        uid: Joi.string().required(),
      }),
      params: {
        id: Joi.string()
          .description('Community id')
          .required(),
      },
      type: 'json',
      continueOnError: true,
    },
    pre: thisUser.can('edit this community'),
    handler: async ctx => {
      log.debug(
        `Removing user ${ctx.query.uid} from community ${ctx.params.id}.`,
      );
      let community, user;

      try {
        community = await communityModel.findOne({ uuid: ctx.params.id }, [
          'members',
        ]);
        user = await personaModel.findOne({ uuid: ctx.query.uid });
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (user && community && community.members.contains(user)) {
        try {
          log.debug(
            `Community ${community.uuid} found. Removing user ${
              user.uuid
            } from community.`,
          );
          community.members.remove(user);
          await communityModel.persistAndFlush(community);
        } catch (err) {
          log.error('HTTP 400 Error: ', err);
          ctx.throw(400, `Failed to remove user from community: ${err}`);
        }
      } else {
        log.error('HTTP 404 Error: user or community not found');
        ctx.throw(
          404,
          'Failed to remove user from community: user or community not found',
        );
      }
      // if deleted
      ctx.status = 204;
    },
  });

  communities.route({
    method: 'PUT',
    path: '/communities/:id/owners/:uid',
    validate: {
      params: {
        id: Joi.string()
          .description('Community id')
          .required(),
        uid: Joi.string()
          .description('User id')
          .required(),
      },
    },
    pre: thisUser.can('edit this community'),
    handler: async ctx => {
      log.debug(`Adding user ${ctx.params.uid} to community ${ctx.params.id}.`);
      let community, user;

      try {
        community = await communityModel.findOne({ uuid: ctx.params.id });
        user = await userModel.findOneByPersona(ctx.params.uid);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (!community || !user) {
        log.error('HTTP 404 Error: Community or user not found.');
        ctx.throw(404, 'Community or user not found.');
      }

      try {
        log.debug(
          `Community ${community.uuid} found. Adding user ${
            user.uuid
          } to community.`,
        );
        community.owners.add(user);
        await communityModel.persistAndFlush(community);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to add user to community: ${err}`);
      }

      ctx.body = {
        status: 201,
        message: 'User has been added to community',
        data: user,
      };
      ctx.status = 201;
    },
    meta: {
      swagger: {
        operationId: 'PutCommunityOwner',
        summary:
          'Endpoint to PUT one owner to a community by ID from PREreview. Admin users only.',
        required: true,
      },
    },
  });

  communities.route({
    meta: {
      swagger: {
        operationId: 'DeleteCommunityOwner',
        summary:
          'Endpoint to DELETE one owner from a community by ID from PREreview. Admin users only.',
        required: true,
      },
    },
    method: 'DELETE',
    path: '/communities/:id/owners',
    validate: {
      query: Joi.object({
        uid: Joi.string().required(),
      }),
      params: {
        id: Joi.string()
          .description('Community id')
          .required(),
      },
      type: 'json',
      continueOnError: true,
    },
    pre: thisUser.can('edit this community'),
    handler: async ctx => {
      log.debug(
        `Removing user ${ctx.query.uid} from community ${ctx.params.id}.`,
      );
      let community, user;

      try {
        community = await communityModel.findOne({ uuid: ctx.params.id }, [
          'owners',
        ]);
        user = await userModel.findOneByPersona(ctx.query.uid);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (user && community && community.owners.contains(user)) {
        try {
          log.debug(
            `Community ${community.uuid} found. Removing user ${
              user.uuid
            } from community.`,
          );
          community.owners.remove(user);
          await communityModel.persistAndFlush(community);
        } catch (err) {
          log.error('HTTP 400 Error: ', err);
          ctx.throw(400, `Failed to remove owner from community: ${err}`);
        }
      } else {
        log.error('HTTP 404 Error: user or community not found');
        ctx.throw(
          404,
          'Failed to remove owner from community: user or community not found',
        );
      }
      // if deleted
      ctx.status = 204;
    },
  });

  communities.route({
    meta: {
      swagger: {
        operationId: 'PutCommunityEvent',
        summary: 'Endpoint to PUT events for a single community.',
      },
    },
    method: 'PUT',
    path: '/communities/:id/events/:eid',
    // validate: {    },
    pre: thisUser.can('edit this community'),
    handler: async ctx => {
      const communityId = ctx.params.id;
      const eventId = ctx.params.eid;
      let newEvent;
      log.debug(`Updating event for community ${communityId}`);

      try {
        const exists = await eventModel.findOne({
          uuid: eventId,
          community: communityId,
        });
        if (exists) {
          log.debug('Event already exists, updating.');
          eventModel.assign(exists, ctx.request.body);
          await eventModel.persistAndFlush(exists);
          ctx.status = 200;
          ctx.body = {
            status: 200,
            message: 'ok',
            data: exists,
          };
        } else {
          log.debug('Event does not yet exist, creating.');
          newEvent = eventModel.create({
            ...ctx.request.body,
            community: communityId,
          });
          await eventModel.persistAndFlush(newEvent);
          ctx.status = 201;
          ctx.body = {
            status: 201,
            message: 'created',
            data: newEvent,
          };
        }
        newEvent = eventModel.create({
          ...ctx.request.body,
          community: communityId,
        });
        await eventModel.persistAndFlush(newEvent);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse event schema: ${err}`);
      }
    },
  });

  communities.route({
    meta: {
      swagger: {
        operationId: 'PostCommunityEvent',
        summary: 'Endpoint to POST events for a single community.',
      },
    },
    method: 'POST',
    path: '/communities/:id/events',
    validate: {
      body: communitySchema,
      type: 'json',
      continueOnError: true,
    },
    pre: thisUser.can('edit this community'),
    handler: async ctx => {
      if (ctx.invalid) {
        console.log('***invalid!***');
        handleInvalid(ctx);
        return;
      }
      const communityId = ctx.params.id;
      let community, newEvent;
      log.debug(`Add event for community ${communityId}`);

      try {
        community = await communityModel.findOne({ uuid: communityId }, [
          'events',
        ]);
        newEvent = eventModel.create({
          ...ctx.request.body,
          community: community,
        });
        community.events.add(newEvent);
        await communityModel.persistAndFlush(community);
        ctx.status = 201;
        ctx.body = {
          status: 201,
          message: 'created',
          data: newEvent,
        };
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse event schema: ${err}`);
      }
    },
  });

  communities.route({
    meta: {
      swagger: {
        operationId: 'DeleteCommunityEvent',
        summary:
          'Endpoint to DELETE one event from a community by ID from PREreview.',
        required: true,
      },
    },
    method: 'DELETE',
    path: '/communities/:id/events',
    validate: {
      query: Joi.object({
        eid: Joi.string(),
      }),
      params: {
        id: Joi.string()
          .description('Community id')
          .required(),
      },
      type: 'json',
      continueOnError: true,
    },
    pre: thisUser.can('edit this community'),
    handler: async ctx => {
      log.debug(
        `Removing event ${ctx.query.eid} from community ${ctx.params.id}.`,
      );
      let community, event;

      try {
        community = await communityModel.findOne({ uuid: ctx.params.id }, [
          'events',
        ]);
        event = await eventModel.findOne({ uuid: ctx.query.eid });
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (event && community && community.events.contains(event)) {
        try {
          log.debug(
            `Community ${community.uuid} found. Removing event ${
              event.uuid
            } from community.`,
          );
          community.events.remove(event);
          await communityModel.persistAndFlush(community);
        } catch (err) {
          log.error('HTTP 400 Error: ', err);
          ctx.throw(400, `Failed to remove event from community: ${err}`);
        }
      } else {
        log.error('HTTP 404 Error: event or community not found');
        ctx.throw(
          404,
          'Failed to remove event from community: event or community not found',
        );
      }
      // if deleted
      ctx.status = 204;
    },
  });

  communities.route({
    meta: {
      swagger: {
        operationId: 'PutCommunityTag',
        summary: 'Endpoint to PUT tags for a single community.',
      },
    },
    method: 'PUT',
    path: '/communities/:id/tags/:tid',
    pre: thisUser.can('edit this community'),
    // validate: {    },
    // pre: {},
    handler: async ctx => {
      const communityId = ctx.params.id;
      const tagId = ctx.params.tid;
      let newTag;
      log.debug(`Updating tag for community ${communityId}`);

      try {
        const exists = await tagModel.findOne({
          uuid: tagId,
          community: communityId,
        });
        if (exists) {
          log.debug('Tag already exists, updating.');
          tagModel.assign(exists, ctx.request.body);
          await tagModel.persistAndFlush(exists);
          ctx.status = 200;
          ctx.body = {
            status: 200,
            message: 'ok',
            data: exists,
          };
        } else {
          log.debug('Tag does not yet exist, creating.');
          newTag = tagModel.create({
            ...ctx.request.body,
            community: communityId,
          });
          await tagModel.persistAndFlush(newTag);
          ctx.status = 201;
          ctx.body = {
            status: 201,
            message: 'created',
            data: newTag,
          };
        }
        newTag = tagModel.create({
          ...ctx.request.body,
          community: communityId,
        });
        await tagModel.persistAndFlush(newTag);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse tag schema: ${err}`);
      }
    },
  });

  communities.route({
    meta: {
      swagger: {
        operationId: 'PostCommunityTag',
        summary: 'Endpoint to POST a tag for a single community.',
      },
    },
    method: 'POST',
    path: '/communities/:id/tags',
    validate: {
      body: tagSchema,
      type: 'json',
    },
    pre: thisUser.can('edit this community'),
    handler: async ctx => {
      const communityId = ctx.params.id;
      let community, newTag;
      log.debug(`Add tag for community ${communityId}`);

      try {
        community = await communityModel.findOne({ uuid: communityId }, [
          'tags',
        ]);
        newTag = tagModel.create({
          ...ctx.request.body,
        });
        community.tags.add(newTag);
        await tagModel.em.flush();
        ctx.status = 201;
        ctx.body = {
          status: 201,
          message: 'created',
          data: newTag,
        };
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse event schema: ${err}`);
      }
    },
  });

  communities.route({
    meta: {
      swagger: {
        operationId: 'DeleteCommunityTag',
        summary:
          'Endpoint to DELETE one tag from a community by ID from PREreview. Admin tags only.',
        required: true,
      },
    },
    method: 'DELETE',
    path: '/communities/:id/tags',
    validate: {
      query: Joi.object({
        tid: Joi.string(),
      }),
      params: {
        id: Joi.string()
          .description('Community id')
          .required(),
      },
      type: 'json',
      continueOnError: true,
    },
    pre: thisUser.can('edit this community'),
    handler: async ctx => {
      log.debug(
        `Removing tag ${ctx.query.tid} from community ${ctx.params.id}.`,
      );
      let community, tag;

      try {
        community = await communityModel.findOne({ uuid: ctx.params.id }, [
          'tags',
        ]);
        tag = await tagModel.findOne({ uuid: ctx.query.tid });
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (tag && community && community.tags.contains(tag)) {
        try {
          log.debug(
            `Community ${community.uuid} found. Removing tag ${
              tag.uuid
            } from community.`,
          );
          community.tags.remove(tag);
          await communityModel.persistAndFlush(community);
        } catch (err) {
          log.error('HTTP 400 Error: ', err);
          ctx.throw(400, `Failed to remove tag from community: ${err}`);
        }
      } else {
        log.error('HTTP 404 Error: tag or community not found');
        ctx.throw(
          404,
          'Failed to remove tag from community: tag or community not found',
        );
      }
      // if deleted
      ctx.status = 204;
    },
  });

  return communities;
}
