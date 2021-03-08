import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:rapidReview');
// const Joi = router.Joi;

// eslint-disable-next-line no-unused-vars
export default function controller(rapidReviews, preprints, thisUser) {
  const rapidRouter = router();

  const getHandler = async ctx => {
    let data, id, pid, preprint; // fid = fullReview ID

    if (ctx.params.pid) {
      pid = ctx.params.pid;
      log.debug(
        `Retrieving rapid reviews associated with preprint ${ctx.params.pid}`,
      );
    } else if (ctx.params.id) {
      id = ctx.params.id;
      log.debug(`Retrieving rapid review ${ctx.params.id}`);
    } else {
      log.debug(`Retrieving all rapid reviews.`);
    }

    try {
      if (pid) {
        preprint = await preprints.findOneByUuidOrHandle(pid);
        data = await rapidReviews.find({ preprint: preprint });
      } else if (id) {
        data = await rapidReviews.findOne({ uuid: id });
      } else {
        data = await rapidReviews.findAll();
      }
    } catch (error) {
      log.error('HTTP 400 Error: ', error);
      return ctx.throw(400, { message: error.message });
    }

    if (id && !data) {
      log.error(`HTTP 404 Error: No Rapid Review with id ${id}`);
      return ctx.throw(404, `No Rapid Review with id ${id}.`);
    }

    ctx.body = { data };
    ctx.status = 200;
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
    // validate: {},
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
    // validate: {},
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
