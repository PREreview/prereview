import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:persona');
const Joi = router.Joi;

// eslint-disable-next-line no-unused-vars
export default function controller(personasModel, thisUser) {
  const personaRouter = router();

  // no POST because persona is created by the auth controller when
  // a new user first registers with PREreview

  personaRouter.route({
    meta: {
      swagger: {
        operationId: 'GetPersonas',
        summary: 'Endpoint to GET all personas. Admin users only.',
      },
    },
    method: 'get',
    path: '/personas',
    // pre:thisUser.can('access admin pages'),
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving personas.`);
      let allPersonas;

      try {
        allPersonas = await personasModel.findAll([
          'fullReviews',
          'rapidReviews',
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
  });

  personaRouter.route({
    meta: {
      swagger: {
        operationId: 'GetPersona',
        summary: 'Endpoint to GET one persona by ID. Admin users only.',
        required: true,
      },
    },
    method: 'get',
    path: '/personas/:id',
    // validate: {}
    // pre: thisUser.can('access private pages'), // TODO: can edit self only no?
    handler: async ctx => {
      log.debug(`Retrieving persona ${ctx.params.id}.`);
      let persona;

      try {
        persona = await personasModel.findOne(ctx.params.id);
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
  });

  personaRouter.route({
    meta: {
      swagger: {
        operationId: 'PutPersona',
        summary: 'Endpoint to PUT one persona by ID. Admin users only.',
        required: true,
      },
    },
    method: 'put',
    path: '/personas/:id',
    validate: {
      body: Joi.object({
        name: Joi.string(),
        identity: Joi.number().integer(), // the ID of a user object
      }),
      type: 'json',
      params: Joi.object({
        id: Joi.number().integer(),
      }),
      continueOnError: false,
      false: 400,
    },
    // pre:thisUserthisUser.can('access private pages'), // TODO: can edit self only no?
    handler: async ctx => {
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
  });

  // FIXME: do we need delete?

  return personaRouter;
}
