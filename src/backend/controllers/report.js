import router from 'koa-joi-router';
import { QueryOrder } from '@mikro-orm/core';
import { getLogger } from '../log.js';
import { getErrorMessages } from '../utils/errors';

const log = getLogger('backend:controller:report');
const Joi = router.Joi;

const querySchema = Joi.object({
  limit: Joi.number()
    .integer()
    .greater(-1),
  offset: Joi.number()
    .integer()
    .greater(-1),
  asc: Joi.boolean(),
  types: Joi.string().allow(''),
});

const reportSchema = Joi.object({
  reason: Joi.string().required(),
});

const handleInvalid = ctx => {
  log.debug('Validation error!');
  log.error('Error details ', ctx.invalid);
  ctx.status = 400;
  ctx.message = getErrorMessages(ctx.invalid);
};

// eslint-disable-next-line no-unused-vars
export default function controller(reportModel, commentModel, fullReviewModel, personaModel, rapidReviewModel, thisUser) {
  const reportsRouter = router();

  const findReport = async (uuid, type) => {
    let report;

    if (!type || String.toLowerCase(type) === 'comment') {
      report = await commentModel.findOne({ uuid: uuid });
      if (report) {
        return report;
      }
    }

    if (!type || String.toLowerCase(type) === 'fullreview') {
      report = await fullReviewModel.findOne({ uuid: uuid });
      if (report) {
        return report;
      }
    }

    if (!type || String.toLowerCase(type) === 'persona') {
      report = await personaModel.findOne({ uuid: uuid });
      if (report) {
        return report;
      }
    }

    if (!type || String.toLowerCase(type) === 'rapidreview') {
      report = await rapidReviewModel.findOne({ uuid: uuid });
      if (report) {
        return report;
      }
    }

    return report;
  };

  // handler for GET multiple reports
  const getHandler = async ctx => {
    let reports, id; // cid = community ID

    id = ctx.params.id ? ctx.params.id : null;

    try {
      if (id) {
        log.debug(`Retrieving report with uuid ${id}.`);
        reports = await reportModel.find({ uuid: id });
      } else {
        log.debug(`Retrieving all reports.`);
        const order = ctx.query.asc
          ? QueryOrder.ASC_NULLS_LAST
          : QueryOrder.DESC_NULLS_LAST;
        reports = await reportModel.findAll(
          [],
          { createdAt: order },
          ctx.query.limit,
          ctx.query.offset,
        );
      }
    } catch (err) {
      log.error('HTTP 400 error: ', err);
      ctx.throw(400, `Failed to retrieve reports`);
    }

    ctx.response.body = {
      status: 200,
      message: 'ok',
      data: reports,
    };
    ctx.status = 200;
  };

  reportsRouter.route({
    method: 'GET',
    path: '/reports',
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    validate: {
      query: querySchema,
      continueOnError: true,
    },
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }
      await getHandler(ctx);
    },
    meta: {
      swagger: {
        operationId: 'GetReports',
        summary: 'Endpoint to GET all reports.',
      },
    },
  });

  reportsRouter.route({
    method: 'GET',
    path: '/reports/:id',
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    validate: {
      query: querySchema,
      continueOnError: true,
    },
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }
      await getHandler(ctx);
    },
    meta: {
      swagger: {
        operationId: 'GetReport',
        summary: 'Endpoint to GET a specific report.',
      },
    },
  });

  reportsRouter.route({
    method: 'DELETE',
    path: '/reports/:id',
    pre: (ctx, next) => thisUser.can('access admin pages')(ctx, next),
    // validate: {},
    handler: async ctx => {
      log.debug(`Removing report with ID ${ctx.params.id}`);
      let report;

      try {
        report = await reportModel.findOne({ uuid: ctx.params.id });

        if (!report) {
          ctx.throw(404, `A report with ID ${ctx.params.id} doesn't exist`);
        }

        await reportModel.removeAndFlush(report);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse report schema: ${err}`);
      }

      // if deleted
      ctx.status = 204;
    },
    meta: {
      swagger: {
        operationId: 'DeleteReport',
        summary: 'Endpoint to DELETE a report.',
        required: true,
      },
    },
  });

  reportsRouter.route({
    method: 'GET',
    path: '/reported/:id',
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    validate: {
      query: querySchema,
    },
    handler: async ctx => {
      log.debug(`Retrieving report ${ctx.params.id}.`);
      let types, found;

      if (ctx.query.types) {
        const queries = ctx.query.split(',');
        if (queries.length > 0) {
          types = queries;
        }
      }

      try {
        if (types) {
          types.forEach(type => {
            found = findReport(ctx.params.id, type);
          });
        } else {
          found = findReport(ctx.params.id);
        }
      } catch (err) {
        log.error(`HTTP 400 error: ${err}`);
        ctx.throw(400, `Failed to retrieve report ${err}`);
      }

      if (!found) {
        ctx.throw(404, `report with ID ${ctx.params.id} doesn't exist`);
      }

      ctx.response.body = {
        status: 200,
        message: 'ok',
        data: [found],
      };
      ctx.status = 200;
    },
    meta: {
      swagger: {
        operationId: 'GetReported',
        summary: 'Endpoint to GET a report of a specific entity.',
        required: true,
      },
    },
  });

  reportsRouter.route({
    method: 'PUT',
    path: '/reported/:id',
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    validate: {
      query: querySchema,
    },
    handler: async ctx => {
      log.debug(`Retrieving report ${ctx.params.id}.`);
      let found, types;

      if (ctx.query.types) {
        const queries = ctx.query.split(',');
        if (queries.length > 0) {
          types = queries;
        }
      }

      try {
        if (types) {
          types.forEach(type => {
            found = findReport(ctx.params.id, type);
          });
        } else {
          found = findReport(ctx.params.id);
        }
      } catch (err) {
        log.error(`HTTP 400 error: ${err}`);
        ctx.throw(400, `Failed to retrieve report ${err}`);
      }

      if (!found) {
        ctx.throw(404, `report with ID ${ctx.params.id} doesn't exist`);
      }

      const report = reportModel.create({ author: ctx.state.user, subject: ctx.params.id, reason: ctx.request.body.reason });
      await reportModel.persistAndFlush(report);

      ctx.status = 204;
    },
    meta: {
      swagger: {
        operationId: 'PutReported',
        summary: 'Endpoint to PUT a report of a specific entity.',
        required: true,
      },
    },
  });

  return reportsRouter;
}
