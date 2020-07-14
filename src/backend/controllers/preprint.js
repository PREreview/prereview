import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import { getLogger } from '../log.js';
import { BadRequestError } from '../../common/errors.js';

const log = getLogger('backend:controllers:preprint');

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
export default function controller(preprints, thisUser) {
  const router = new Router();

  router.post('/preprints', thisUser.can('access admin pages'), async ctx => {
    log.debug('Adding new preprint.');
    let preprint;

    try {
      preprint = await preprints.create(ctx.request.body.data);

      // workaround for sqlite
      if (Number.isInteger(preprint)) {
        preprint = await preprints.findById(preprint);
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse preprint schema: ${err}`);
    }

    ctx.response.body = { statusCode: 201, status: 'created', data: preprint };
    ctx.response.status = 201;
  });

  router.get('/preprints', thisUser.can('access private pages'), async ctx => {
    log.debug(`Retrieving preprints.`);
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
      res = await preprints.find({
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

  router.get('/preprints/:id', thisUser.can('view this library'), async ctx => {
    log.debug(`Retrieving preprint ${ctx.params.id}.`);
    let preprint;

    try {
      preprint = await preprints.findById(ctx.params.id);
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (preprint.length) {
      ctx.response.body = { statusCode: 200, status: 'ok', data: preprint };
      ctx.response.status = 200;
    } else {
      log.error(
        `HTTP 404 Error: That preprint with ID ${
          ctx.params.id
        } does not exist.`,
      );
      ctx.throw(404, `That preprint with ID ${ctx.params.id} does not exist.`);
    }
  });

  router.put('/preprints/:id', thisUser.can('view this library'), async ctx => {
    log.debug(`Updating preprint ${ctx.params.id}.`);
    let preprint;

    try {
      preprint = await preprints.update(ctx.params.id, ctx.request.body.data);

      // workaround for sqlite
      if (Number.isInteger(preprint)) {
        preprint = await preprints.findById(ctx.params.id);
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (preprint.length && preprint.length > 0) {
      ctx.response.body = { statusCode: 200, status: 'ok', data: preprint };
      ctx.response.status = 200;
    } else {
      log.error(
        `HTTP 404 Error: That preprint with ID ${
          ctx.params.id
        } does not exist.`,
      );
      ctx.throw(404, `That preprint with ID ${ctx.params.id} does not exist.`);
    }
  });

  router.delete(
    '/preprints/:id',
    thisUser.can('view this library'),
    async ctx => {
      log.debug(`Deleting preprint ${ctx.params.id}.`);
      let preprint;

      try {
        preprint = await preprints.delete(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (preprint.length && preprint.length > 0) {
        ctx.response.body = { status: 'success', data: preprint };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That preprint with ID ${
            ctx.params.id
          } does not exist.`,
        );
        ctx.throw(
          404,
          `That preprint with ID ${ctx.params.id} does not exist.`,
        );
      }
    },
  );

  return router;
}
