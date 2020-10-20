import router from 'koa-joi-router';
// import moment from 'moment';
import { getLogger } from '../log.js';
// import { BadRequestError } from '../../common/errors.js';

const log = getLogger('backend:controllers:prereview');
const Joi = router.Joi;

// eslint-disable-next-line no-unused-vars
export default function controller(prereviews, thisUser) {
  const prereviewRouter = router();

  prereviewRouter.route({
    method: 'post',
    path: '/prereviews',
    pre: async => {
      await thisUser.can('access private pages');
      return next();
    },
    validate: {
      // header: {},
      // query: {},
      // params: {},
      //
      body: {
        doi: Joi.string().required(),
        authors: Joi.array(),
        is_hidden: Joi.boolean(),
        content: Joi.array(),
      },
      type: 'json',
      // failure: 400,
      output: {
        201: {
          // could even be a code range!
          body: {},
        },
      },
      continueOnError: false,
    },
    handler: async ctx => {
      // prob will not need all the below anymore
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

      ctx.response.body = {
        statusCode: 201,
        status: 'created',
        data: prereview,
      };
      ctx.response.status = 201;
    },
  });

  prereviewRouter.route({
    method: 'get',
    path: '/prereviews',
    // pre: async ctx => {
      // thisUser.can('')
    // },
    validate: {
      query: Joi.object({
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
      }),
      // params: {},
      // headers: {},
    },
    handler: async ctx => {
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
    },
  });

  prereviewRouter.route({
    method: 'get',
    path: '/prereviews/:id',
    validate: {
      // actually not sure if this is needed
    },
   // pre: async ctx => {
      // thisUser.can('')
    // },
    handler: async ctx => {
      log.debug(`Retrieving prereview ${ctx.params.id}.`);

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
  })

  prereviewRouter.route({
    method: 'put',
    path: '/prereviews/:id',
    // pre: async ctx => {
      // thisUser.can('')
    // },
    handler: async ctx => {
      log.debug(`Updating prereview ${ctx.params.id}.`)
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
    }
  })

  prereviewRouter.route({
    method: 'delete',
    path: '/prereviews/:id',
    // pre: async ctx => {
      // thisUser.can('')
    // },
    handler: async ctx => {
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
    }
  });

  return router;
}
