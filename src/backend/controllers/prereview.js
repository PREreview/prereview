import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import { getLogger } from '../log.js';
import { BadRequestError } from '../../common/errors.js';

const log = getLogger('backend:controllers:prereview');

const query_schema = Joi.object({
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

async function validate_query(query) {
  try {
    const value = await query_schema.validateAsync(query);
    return value;
  } catch (err) {
    throw new BadRequestError('Unable to validate query: ', err);
  }
}

// eslint-disable-next-line no-unused-vars
export default function controller(prereviews, thisUser) {
  const router = new Router();

  router.post('/prereviews', thisUser.can('access admin pages'), async ctx => {
    log.debug('Adding new prereview.');
    let prereview;

    try {
      prereview = await prereviews.create(ctx.request.body.data);

      // workaround for sqlite
      if (Number.isInteger(prereview)) {
        prereview = await prereviews.findById(prereview);
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse prereview schema: ${err}`);
    }

    ctx.response.body = { statusCode: 201, status: 'created', data: prereview };
    ctx.response.status = 201;
  });

  router.get('/prereviews', thisUser.can('access private pages'), async ctx => {
    log.debug(`Retrieving prereviews.`);
    let res;
    try {
      const query = await validate_query(ctx.query);
      let from, to;

      if (query.from) {
        const timestamp = moment(query.from);
        if (timestamp.isValid()) {
          log.error('HTTP 400 Error: Invalid timestamp value.');
          ctx.throw(400, 'Invalid timestamp value.');
        }
        from = timestamp.toISOString();
      }
      if (query.to) {
        const timestamp = moment(query.to);
        if (timestamp.isValid()) {
          log.error('HTTP 400 Error: Invalid timestamp value.');
          ctx.throw(400, 'Invalid timestamp value.');
        }
        to = timestamp.toISOString();
      }
      res = await prereviews.find({
        start: query.start,
        end: query.end,
        asc: query.asc,
        sort_by: query.sort_by,
        from: from,
        to: to,
      });
      ctx.response.body = {
        statusCode: 200,
        status: 'ok',
        data: res,
      };
      ctx.response.status = 200;
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.get(
    '/prereviews/:id',
    thisUser.can('view this library'),
    async ctx => {
      log.debug(`Retrieving prereview ${ctx.params.id}.`);
      let prereview;

      try {
        prereview = await prereviews.findById(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (prereview.length) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: prereview };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That prereview with ID ${
            ctx.params.id
          } does not exist.`,
        );
        ctx.throw(
          404,
          `That prereview with ID ${ctx.params.id} does not exist.`,
        );
      }
    },
  );

  router.put(
    '/prereviews/:id',
    thisUser.can('view this library'),
    async ctx => {
      log.debug(`Updating prereview ${ctx.params.id}.`);
      let prereview;

      try {
        prereview = await prereviews.update(
          ctx.params.id,
          ctx.request.body.data,
        );

        // workaround for sqlite
        if (Number.isInteger(prereview)) {
          prereview = await prereviews.findById(ctx.params.id);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (prereview.length && prereview.length > 0) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: prereview };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That prereview with ID ${
            ctx.params.id
          } does not exist.`,
        );
        ctx.throw(
          404,
          `That prereview with ID ${ctx.params.id} does not exist.`,
        );
      }
    },
  );

  router.delete(
    '/prereviews/:id',
    thisUser.can('view this library'),
    async ctx => {
      log.debug(`Deleting prereview ${ctx.params.id}.`);
      let prereview;

      try {
        prereview = await prereviews.delete(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (prereview.length && prereview.length > 0) {
        ctx.response.body = { status: 'success', data: prereview };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That prereview with ID ${
            ctx.params.id
          } does not exist.`,
        );
        ctx.throw(
          404,
          `That prereview with ID ${ctx.params.id} does not exist.`,
        );
      }
    },
  );

  return router;
}
