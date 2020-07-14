import Router from '@koa/router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:setting');

// eslint-disable-next-line no-unused-vars
export default function controller(settings, thisUser) {
  const router = new Router();

  router.get(
    '/settings/:key',
    thisUser.can('access admin pages'),
    async ctx => {
      log.debug(`Retrieving setting ${ctx.params.key}.`);
      let setting;

      try {
        setting = await settings.findById(ctx.params.key);
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
  );

  router.get('/settings', thisUser.can('access private pages'), async ctx => {
    log.debug(`Retrieving settings.`);
    let setting;

    try {
      setting = await settings.findAll();
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    ctx.response.body = { statusCode: 200, status: 'ok', data: setting || [] };
    ctx.response.status = 200;
  });

  router.put(
    '/settings/:key',
    thisUser.can('access admin pages'),
    async ctx => {
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
  );

  router.delete(
    '/settings/:key',
    thisUser.can('access admin pages'),
    async ctx => {
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
  );

  return router;
}
