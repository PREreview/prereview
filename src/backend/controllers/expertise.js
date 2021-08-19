import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:expertises');
// const Joi = router.Joi;

export default function controller(expertiseModel, thisUser) {
  const expertisesRouter = router();

  expertisesRouter.route({
    meta: {
      swagger: {
        operationId: 'PostExpertises',
        summary: 'Endpoint to POST a expertise.',
      },
    },
    method: 'post',
    path: '/expertises',
    pre: thisUser.can('access admin pages'),
    // validate: {},
    handler: async ctx => {
      log.debug(`Adding a new expertise.`);
      let expertise;

      try {
        expertise = expertiseModel.create(ctx.request.body);
        await expertiseModel.persistAndFlush(expertise);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse expertise schema: ${err}`);
      }

      ctx.body = {
        status: 201,
        message: 'created',
        data: [expertise],
      };
      ctx.status = 201;
    },
  });

  expertisesRouter.route({
    meta: {
      swagger: {
        operationId: 'GetExpertises',
        summary: 'Endpoint to GET all expertises.',
      },
    },
    method: 'get',
    path: '/expertises',
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving expertises.`);
      let allExpertises;

      try {
        allExpertises = await expertiseModel.findAll(['personas']);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse expertise schema: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: allExpertises,
      };
      ctx.status = 200;
    },
  });

  expertisesRouter.route({
    meta: {
      swagger: {
        operationId: 'GetExpertise',
        summary: 'Endpoint to GET a single expertise by ID.',
        required: true,
      },
    },
    method: 'get',
    path: '/expertises/:id',
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving expertise with id ${ctx.params.id}.`);
      let expertise;

      try {
        expertise = await expertiseModel.findOne({ uuid: ctx.params.id }, [
          'personas',
        ]);
        if (!expertise) {
          ctx.throw(404, `expertise with ID ${ctx.params.id} doesn't exist`);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse expertise schema: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: [expertise],
      };
      ctx.status = 200;
    },
  });

  expertisesRouter.route({
    meta: {
      swagger: {
        operationId: 'PutExpertise',
        summary: 'Endpoint to PUT a single expertise by ID.',
        required: true,
      },
    },
    method: 'put',
    path: '/expertises/:id',
    pre: thisUser.can('access admin pages'),
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Updating expertise with id ${ctx.params.id}.`);
      let expertise;

      try {
        expertise = await expertiseModel.findOne({ uuid: ctx.params.id });
        if (!expertise) {
          ctx.throw(404, `Expertise with ID ${ctx.params.id} doesn't exist`);
        }
        expertiseModel.assign(expertise, ctx.request.body);
        await expertiseModel.persistAndFlush(expertise);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse expertise schema: ${err}`);
      }

      // if updated
      ctx.status = 204;
    },
  });

  expertisesRouter.route({
    meta: {
      swagger: {
        operationId: 'DeleteExpertise',
        summary: 'Endpoint to DELETE a single expertise by ID.',
        required: true,
      },
    },
    method: 'delete',
    path: '/expertises/:id',
    pre: thisUser.can('access admin pages'),
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving expertise with id ${ctx.params.id}.`);
      let expertise;

      try {
        expertise = await expertiseModel.findOne({ name: ctx.params.id });
        if (!expertise) {
          ctx.throw(404, `Expertise with ID ${ctx.params.id} doesn't exist`);
        }
        await expertiseModel.removeAndFlush(expertise);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse expertise schema: ${err}`);
      }

      // if deleted
      ctx.status = 204;
    },
  });

  return expertisesRouter;
}
