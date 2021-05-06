import router from 'koa-joi-router';
import { QueryOrder } from '@mikro-orm/core';
import { getLogger } from '../log.js';
import { getFields } from '../utils/getFields.ts';

const log = getLogger('backend:controllers:rapidReview');
const Joi = router.Joi;

const querySchema = Joi.object({
  limit: Joi.number()
    .integer()
    .greater(-1),
  offset: Joi.number()
    .integer()
    .greater(-1),
  asc: Joi.boolean(),
  is_published: Joi.boolean(),
  include_images: Joi.string().allow(''),
});

export default function controller(rapidReviews, preprints, thisUser) {
  const rapidRouter = router();

  const getHandler = async ctx => {
    let count, data, pid;

    if (ctx.params.pid) {
      pid = ctx.params.pid;
      log.debug(
        `Retrieving rapid reviews associated with preprint ${ctx.params.pid}`,
      );
    } else {
      log.debug(`Retrieving all rapid reviews.`);
    }

    try {
      const queries = [];
      if (
        ctx.query.is_published !== undefined &&
        ctx.query.is_published !== null
      ) {
        queries.push({ isPublished: { $eq: ctx.query.is_published } });
      }

      if (pid) {
        queries.push({ preprint: { uuid: { $eq: pid } } });
      }

      const order = ctx.query.asc
        ? QueryOrder.ASC_NULLS_LAST
        : QueryOrder.DESC_NULLS_LAST;

      const options = {
        fields: getFields(
          'RapidReview',
          ctx.query.include_images
            ? ctx.query.include_images.split(',')
            : undefined,
        ),
        populate: ['author', 'preprint'],
        orderBy: { updatedAt: order },
        limit: ctx.query.limit,
        offset: ctx.query.offset,
      };

      if (queries.length > 0) {
        let query;
        if (queries.length > 1) {
          query = { $and: queries };
        } else {
          query = queries[0];
        }
        log.debug('Querying rapid reviews:', query);
        [data, count] = await rapidReviews.findAndCount(query, options);
      } else {
        data = await rapidReviews.findAll(options);
        count = await rapidReviews.count();
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (!data || count <= 0) {
      ctx.status = 204;
    }

    ctx.body = {
      status: 200,
      message: 'ok',
      totalCount: count,
      data: data,
    };
  };

  rapidRouter.route({
    meta: {
      swagger: {
        operationId: 'PostRapidReviews',
        summary: 'Endpoint to POST a rapid review.',
      },
    },
    method: 'post',
    path: '/rapid-reviews',
    pre: thisUser.can('access private pages'),
    // validate: {},
    handler: async ctx => {
      log.debug('Posting a rapid review.');
      let rapidReview, authorPersona, preprint;

      try {
        authorPersona = ctx.state.user.defaultPersona;
      } catch (err) {
        log.error('Failed to load user personas.');
        ctx.throw(400, err);
      }

      try {
        log.debug('authorPersona', authorPersona);
        preprint = await preprints.findOneByUuidOrHandle(
          ctx.request.body.preprint,
        );
        preprint.isPublished = true;
        rapidReview = rapidReviews.create({
          ...ctx.request.body,
          author: authorPersona,
          preprint: preprint,
        });
        await rapidReviews.persistAndFlush(rapidReview);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse schema: ${err}`);
      }

      ctx.body = {
        status: 201,
        message: 'created',
        data: [rapidReview],
      };
      ctx.status = 201;
    },
  });

  rapidRouter.route({
    meta: {
      swagger: {
        operationId: 'GetRapidReviews',
        summary: 'Endpoint to GET all rapid reviews.',
      },
    },
    method: 'get',
    path: '/rapid-reviews',
    validate: {
      query: querySchema,
    },
    handler: getHandler,
  });

  rapidRouter.route({
    meta: {
      swagger: {
        operationId: 'GetPreprintRapidReviews',
        summary: 'Endpoint to GET all rapid reviews of a single preprint.',
        required: true,
      },
    },
    method: 'get',
    path: '/preprints/:pid/rapid-reviews',
    validate: {
      query: querySchema,
    },
    handler: getHandler,
  });

  rapidRouter.route({
    meta: {
      swagger: {
        operationId: 'GetRapidReview',
        summary: 'Endpoint to GET one rapid review by ID.',
        required: true,
      },
    },
    method: 'get',
    path: '/rapid-reviews/:id',
    // pre: thisUser.can('access private pages'),
    // validate: {},
    handler: async ctx => {
      // if (ctx.invalid) {
      //   log.error('400 Error! This is the error object', '\n', ctx.invalid);
      //   handleValidationError(ctx);
      //   return next();
      // }

      log.debug(`Retrieving rapid review ${ctx.params.id}`);
      let rapid;

      try {
        rapid = await rapidReviews.findOne({ uuid: ctx.params.id }, [
          'author',
          'preprint',
        ]);
        if (!rapid) {
          ctx.throw(404, `Rapid review with ID ${ctx.params.id} doesn't exist`);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: [rapid],
      };
    },
  });

  rapidRouter.route({
    meta: {
      swagger: {
        operationId: 'PutRapidReview',
        summary: 'Endpoint to PUT one rapid review by ID.',
        required: true,
      },
    },
    method: 'put',
    path: '/rapid-reviews/:id',
    pre: thisUser.can('access admin pages'),
    // validate: {},
    handler: async ctx => {
      // if (ctx.invalid) {
      //   log.error('400 Error! This is the error object', '\n', ctx.invalid);
      //   handleValidationError(ctx);
      //   return next();
      // }

      log.debug(`Updating rapid review ${ctx.params.id}`);
      let rapid;

      try {
        rapid = await rapidReviews.findOne({ uuid: ctx.params.id });
        if (!rapid) {
          ctx.throw(404, `Rapid review with ID ${ctx.params.id} doesn't exist`);
        }
        rapidReviews.assign(rapid, ctx.request.body);
        await rapidReviews.persistAndFlush(rapid);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse schema: ${err}`);
      }

      // if updated
      ctx.status = 204;
    },
  });

  rapidRouter.route({
    meta: {
      swagger: {
        operationId: 'DeleteRapidReview',
        summary: 'Endpoint to DELETE one rapid review by ID.',
        required: true,
      },
    },
    method: 'delete',
    path: '/rapid-reviews/:id',
    pre: thisUser.can('access admin pages'),
    // validate: {},
    handler: async ctx => {
      log.debug(`Updating rapid review ${ctx.params.id}`);
      let rapid;

      try {
        rapid = await rapidReviews.findOne({ uuid: ctx.params.id });
        if (!rapid) {
          ctx.throw(404, `Rapid review with ID ${ctx.params.id} doesn't exist`);
        }
        await rapidReviews.removeAndFlush(rapid);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse schema: ${err}`);
      }

      // if deleted
      ctx.status = 204;
    },
  });

  return rapidRouter;
}
