import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:prereview');
const Joi = router.Joi;

// const querySchema = Joi.object({
//   start: Joi.number()
//     .integer()
//     .greater(-1),
//   end: Joi.number()
//     .integer()
//     .positive(),
//   asc: Joi.boolean(),
//   sort_by: Joi.string(),
//   from: Joi.string(),
//   to: Joi.string(),
// });

// eslint-disable-next-line no-unused-vars
export default function controller(prereviews, thisUser) {
  const prereviewRouter = router();

  prereviewRouter.route({
    method: 'post',
    path: '/prereviews',
    pre: async (_, next) => {
      await thisUser.can('access private pages');
      return next();
    },
    validate: {
      body: {
        doi: Joi.string().required(),
        authors: Joi.array(),
        is_hidden: Joi.boolean(),
        content: Joi.array(),
      },
      type: 'json',
      failure: 400,
      // output: {
      //   201: {
      //     // could even be a code range!
      //     body: {},
      //   },
      // },
    },
    handler: async ctx => {
      log.debug('Posting prereview...');

      try {
        const prereview = prereviews.create(ctx.request.body);
        await prereviews.persistAndFlush(prereview);
      } catch (error) {
        return ctx.throw(400, { message: error.message });
      }

      ctx.response.status = 201;
    },
  });

  prereviewRouter.route({
    method: 'get',
    path: '/prereviews',
    handler: async ctx => {
      log.debug(`Retrieving prereviews.`);

      try {
        const allPrereviews = await prereviews.findAll();
        if (allPrereviews) {
          ctx.response.body = {
            statusCode: 200,
            status: 'ok',
            data: allPrereviews,
          };
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }
    },
  });

  prereviewRouter.route({
    method: 'get',
    path: '/prereviews/:id',
    handler: async ctx => {
      log.debug(`Retrieving prereview ${ctx.params.id}.`);
      let prereview;

      try {
        prereview = await prereviews.findOne(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (prereview.length) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: prereview };
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
  });

  // TODO
  // prereviewRouter.route({
  //   method: 'put',
  //   path: '/prereviews/:id',
  //   // pre: async ctx => {
  //   // thisUser.can('')
  //   // },
  //   handler: async ctx => {
  //     log.debug(`Updating prereview ${ctx.params.id}.`);
  //     let prereview;

  //     try {
  //       prereview = await prereviews.update(
  //         ctx.params.id,
  //         ctx.request.body.data,
  //       );

  //       // workaround for sqlite
  //       if (Number.isInteger(prereview)) {
  //         prereview = await prereviews.findById(ctx.params.id);
  //       }

  //     } catch (err) {
  //       log.error('HTTP 400 Error: ', err);
  //       ctx.throw(400, `Failed to parse query: ${err}`);
  //     }
  //   },
  // });

  prereviewRouter.route({
    method: 'delete',
    path: '/prereviews/:id',
    pre: async () => thisUser.can('access admin pages'),
    handler: async ctx => {
      log.debug(`Deleting prereview ${ctx.params.id}.`);
      let prereview;

      try {
        prereview = prereviews.findOne(ctx.params.id);
        await prereviews.removeAndFlush(prereview);
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
  });

  return prereviewRouter;
}
