import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:persona');
const Joi = router.Joi;

export default function controller(personas) {
  const personaRouter = router();

  personaRouter.route({
    method: 'get',
    path: '/personas',
    // pre:thisUser.can('access admin pages'),
    handler: async ctx => {
      log.debug(`Retrieving personas.`);

      try {
        const allPersonas = await personas.findAll();
        ctx.body = {
          statusCode: 200,
          status: 'ok',
          data: allPersonas,
        };
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }
    },
  });

  personaRouter.route({
    method: 'put',
    path: '/personas/:id',
    validate: {
      body: Joi.object({
        name: Joi.string(),
        identity: Joi.integer(), // the ID of a user object
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

      const persona = await personas.findOne(ctx.params.id);

      if (!persona) {
        ctx.throw(404, `That persona with ID ${ctx.params.id} does not exist.`);
      }

      personas.assign(persona, ctx.request.body);
      await personas.persistAndFlush(persona);
    },
  });

  return personaRouter;
}
