import router from 'koa-joi-router';
import { getLogger } from '../log.js';
import { getErrorMessages } from '../utils/errors';

const log = getLogger('backend:controllers:persona');
const Joi = router.Joi;

const handleInvalid = ctx => {
  log.debug('Validation error!');
  log.error(ctx.invalid);
  ctx.status = 400;
  ctx.message = getErrorMessages(ctx.invalid);
};

export default function controller(personasModel, thisUser) {
  const personaRouter = router();

  // no POST because personas are only created by the auth controller when
  // a new user first registers with PREreview

  personaRouter.route({
    method: 'GET',
    path: '/personas',
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving personas.`);
      let allPersonas;

      try {
        allPersonas = await personasModel.findAll([
          'fullReviews',
          'rapidReviews',
          // 'requests',
        ]);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: allPersonas,
      };
    },
    meta: {
      swagger: {
        operationId: 'GetPersonas',
        description:
          'Each user registered on the PREreview platform has two corresponding personas: one which has their public name and another which is anonymous. This endpoint GETs all personas on PREreview and the reviews attributed to each. Returns a 200 if successful, and an array of personas in the `data` attribute of the response body.',
      },
    },
  });

  personaRouter.route({
    method: 'GET',
    path: '/personas/:id',
    // validate: {}
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    handler: async ctx => {
      log.debug(`Retrieving persona ${ctx.params.id}.`);
      let persona;

      try {
        persona = await personasModel.findOne(ctx.params.id, [
          // 'requests',
          'fullReviews',
          'rapidReviews',
        ]);
        if (!persona) {
          ctx.throw(404, `Persona with ID ${ctx.params.id} doesn't exist`);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse schema: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: [persona],
      };
      ctx.status = 200;
    },
    meta: {
      swagger: {
        operationId: 'GetPersona',
        description:
          'GET a single user persona. Returns a 200 if successful, and a single-member array of the persona object in the `data` attribute of the response body.',
      },
    },
  });

  personaRouter.route({
    method: 'PUT',
    path: '/personas/:id',
    validate: {
      body: Joi.object({
        name: Joi.string(),
      }),
      type: 'json',
      params: Joi.object({
        id: Joi.number().integer(),
      }),
      continueOnError: true,
      false: 400,
    },
    pre: (ctx, next) => thisUser.can('access admin pages')(ctx, next), // TODO: can edit self only no?
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }

      log.debug(`Updating persona ${ctx.params.id}.`);
      let persona;

      try {
        persona = await personasModel.findOne(ctx.params.id);
        if (!persona) {
          ctx.throw(
            404,
            `That persona with ID ${ctx.params.id} does not exist.`,
          );
        }
        personasModel.assign(persona, ctx.request.body);
        await personasModel.persistAndFlush(persona);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse schema: ${err}`);
      }

      // if updated
      ctx.status = 204;
    },
    meta: {
      swagger: {
        operationId: 'PutPersona',
        summary: 'Endpoint to PUT one persona by ID. Admin users only.',
        required: true,
      },
    },
  });

  // TODO: do we need delete?

  return personaRouter;
}
