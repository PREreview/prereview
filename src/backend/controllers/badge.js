import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:badges');
// const Joi = router.Joi;

// eslint-disable-next-line no-unused-vars
export default function controller(badgeModel, thisUser) {
  const badgesRouter = router();

  badgesRouter.route({
    meta: {
      swagger: {
        operationId: 'PostBadges',
        summary: 'Endpoint to POST a badge.',
      },
    },
    method: 'post',
    path: '/badges',
    pre: thisUser.can('access admin pages'),
    // validate: {},
    handler: async ctx => {
      log.debug(`Adding a new badge.`);
      let badge;

      try {
        badge = badgeModel.create(ctx.request.body);
        await badgeModel.persistAndFlush(badge);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse badge schema: ${err}`);
      }

      ctx.body = {
        status: 201,
        message: 'created',
        data: [badge],
      };
      ctx.status = 201;
    },
  });

  badgesRouter.route({
    meta: {
      swagger: {
        operationId: 'GetBadges',
        summary: 'Endpoint to GET all badges.',
      },
    },
    method: 'get',
    path: '/badges',
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving badges.`);
      let allBadges;

      try {
        allBadges = await badgeModel.findAll(['personas']);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse badge schema: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: allBadges,
      };
      ctx.status = 200;
    },
  });

  badgesRouter.route({
    meta: {
      swagger: {
        operationId: 'GetBadge',
        summary: 'Endpoint to GET a single badge by ID.',
        required: true,
      },
    },
    method: 'get',
    path: '/badges/:id',
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving badge with id ${ctx.params.id}.`);
      let badge;

      try {
        badge = await badgeModel.findOne({ uuid: ctx.params.id }, ['personas']);
        if (!badge) {
          ctx.throw(404, `badge with ID ${ctx.params.id} doesn't exist`);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse badge schema: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: [badge],
      };
      ctx.status = 200;
    },
  });

  badgesRouter.route({
    meta: {
      swagger: {
        operationId: 'PutBadge',
        summary: 'Endpoint to PUT a single badge by ID.',
        required: true,
      },
    },
    method: 'put',
    path: '/badges/:id',
    pre: thisUser.can('access admin pages'),
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Updating badge with id ${ctx.params.id}.`);
      let badge;

      try {
        badge = await badgeModel.findOne({ uuid: ctx.params.id });
        if (!badge) {
          ctx.throw(404, `Badge with ID ${ctx.params.id} doesn't exist`);
        }
        badgeModel.assign(badge, ctx.request.body);
        await badgeModel.persistAndFlush(badge);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse badge schema: ${err}`);
      }

      // if updated
      ctx.status = 204;
    },
  });

  badgesRouter.route({
    meta: {
      swagger: {
        operationId: 'DeleteBadge',
        summary: 'Endpoint to DELETE a single badge by ID.',
        required: true,
      },
    },
    method: 'DELETE',
    path: '/badges/:id',
    pre: thisUser.can('access admin pages'),
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving badge with id ${ctx.params.id}.`);
      let badge;

      try {
        badge = await badgeModel.findOne({ uuid: ctx.params.id });
        if (!badge) {
          ctx.throw(404, `Badge with ID ${ctx.params.id} doesn't exist`);
        }
        await badgeModel.removeAndFlush(badge);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse badge schema: ${err}`);
      }

      // if deleted
      ctx.status = 204;
    },
  });

  return badgesRouter;
}
