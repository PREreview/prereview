import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:setting');
const Joi = router.Joi;

// eslint-disable-next-line no-unused-vars
export default function controller(settings, thisUser) {
  const settingsRoutes = router();

  settingsRoutes.route({
    method: 'get',
    path: '/settings/:key',
    pre: thisUser.can('access admin pages'),
    handler: async ctx => {
      log.debug(`Retrieving setting ${ctx.params.key}.`);
      let setting;

      try {
        setting = await settings.findOne(ctx.params.key);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (setting.length) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: setting };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That setting with ID ${
            ctx.params.key
          } does not exist.`,
        );
        ctx.throw(
          404,
          `That setting with ID ${ctx.params.key} does not exist.`,
        );
      }
    },
  });

  settingsRoutes.route({
    method: 'get',
    path: '/settings',
    pre: thisUser.can('access admin pages'),
    handler: async ctx => {
      log.debug(`Retrieving settings.`);
      let setting;

      try {
        setting = await settings.findAll();
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      ctx.response.body = {
        statusCode: 200,
        status: 'ok',
        data: setting || [],
      };
      ctx.response.status = 200;
    },
  });

  settingsRoutes.route({
    method: 'put',
    path: '/settings/:key',
    validate: {
      body: {
        value: Joi.string(), // #FIXME
      },
      type: 'json',
    },
    pre: thisUser.can('access admin pages'),
    handler: async ctx => {
      log.debug(`Updating setting ${ctx.params.key}.`);
      let setting;

      try {
        log.debug('ctx.request.body: ', ctx.request.body);
        setting = await settings.update(ctx.params.key, ctx.request.body.data);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      log.debug('setting: ', setting);
      if (setting) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: setting };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That setting with ID ${
            ctx.params.key
          } does not exist.`,
        );
        ctx.throw(
          404,
          `That setting with ID ${ctx.params.key} does not exist.`,
        );
      }
    },
  });

  settingsRoutes.route({
    method: 'delete',
    path: '/settings/:key',
    pre: thisUser.can('access admin pages'),
    handler: async ctx => {
      log.debug(`Deleting setting ${ctx.params.key}.`);
      let setting;

      try {
        setting = await settings.delete(ctx.params.key);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (setting.length && setting.length > 0) {
        ctx.response.body = { status: 'success', data: setting };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That setting with ID ${
            ctx.params.key
          } does not exist.`,
        );
        ctx.throw(
          404,
          `That setting with ID ${ctx.params.key} does not exist.`,
        );
      }
    },
  });

  return settingsRoutes;
}
