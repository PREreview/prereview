import router from 'koa-joi-router';
import { getLogger } from '../log.js';
import { getErrorMessages } from '../utils/errors';

const log = getLogger('backend:controllers:search');
const Joi = router.Joi;

const querySchema = Joi.object({
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
  query: Joi.string(),
});

const handleInvalid = ctx => {
  log.debug('Validation error!');
  log.error(ctx.invalid);
  ctx.status = 400;
  ctx.message = getErrorMessages(ctx.invalid);
};

// eslint-disable-next-line no-unused-vars
export default function controller(preprints, fullReviews, thisUser) {
  const searchRoutes = router();

  // GET
  searchRoutes.route({
    meta: {
      swagger: {
        operationId: 'Search',
        summary: 'Perform a full-text search query across supported tables.',
      },
    },
    method: 'GET',
    path: '/searches',
    validate: {
      query: querySchema, // #TODO
    },
    pre: async (ctx, next) => {
      await thisUser.can('access private pages');
      return next();
    },
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }

      log.debug(`Retrieving preprints.`);

      try {
        let res = {};
        let found = false;
        const foundPreprints = await preprints.search(ctx.query.query);
        const foundFullReviews = await fullReviews.search(ctx.query.query);
        if (Array.isArray(foundPreprints) && foundPreprints.length > 0) {
          res.preprints = foundPreprints;
          found = true;
        }
        if (Array.isArray(foundFullReviews) && foundFullReviews.length > 0) {
          res.fullReviews = foundFullReviews;
          found = true;
        }
        if (found) {
          ctx.body = {
            statusCode: 200,
            status: 'ok',
            data: res,
          };
        } else {
          ctx.response.status = 404;

          ctx.body = {
            statusCode: 404,
            status: `HTTP 404 Error.`,
            message: `No items found matching the query '${ctx.query.query}'.`,
          };
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }
    },
  });

  return searchRoutes;
}
