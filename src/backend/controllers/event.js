import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:events');
// const Joi = router.Joi;

// eslint-disable-next-line no-unused-vars
export default function controller(eventModel, thisUser) {
  const eventsRouter = router();

  eventsRouter.route({
    meta: {
      swagger: {
        operationId: 'PostEvents',
        summary: 'Endpoint to POST a event.',
      },
    },
    method: 'post',
    path: '/events',
    pre: thisUser.can('access admin pages'),
    // validate: {},
    handler: async ctx => {
      log.debug(`Adding a new event.`);
      let event;

      try {
        event = eventModel.create(ctx.request.body);
        await eventModel.persistAndFlush(event);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse event schema: ${err}`);
      }

      ctx.body = {
        status: 201,
        message: 'created',
        data: [event],
      };
      ctx.status = 201;
    },
  });

  eventsRouter.route({
    meta: {
      swagger: {
        operationId: 'GetEvents',
        summary: 'Endpoint to GET all events.',
      },
    },
    method: 'get',
    path: '/events',
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving events.`);
      let allEvents;

      try {
        allEvents = await eventModel.findAll();
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse event schema: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: allEvents,
      };
      ctx.status = 200;
    },
  });

  eventsRouter.route({
    meta: {
      swagger: {
        operationId: 'GetEvent',
        summary: 'Endpoint to GET a single event by ID.',
        required: true,
      },
    },
    method: 'get',
    path: '/events/:id',
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving event with id ${ctx.params.id}.`);
      let event;

      try {
        event = await eventModel.findOne({ uuid: ctx.params.id });
        if (!event) {
          ctx.throw(404, `event with ID ${ctx.params.id} doesn't exist`);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse event schema: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: [event],
      };
      ctx.status = 200;
    },
  });

  eventsRouter.route({
    meta: {
      swagger: {
        operationId: 'PutEvent',
        summary: 'Endpoint to PUT a single event by ID.',
        required: true,
      },
    },
    method: 'put',
    path: '/events/:id',
    pre: thisUser.can('access admin pages'),
    // validate: {},
    handler: async ctx => {
      log.debug(`Updating event with id ${ctx.params.id}.`);
      let event;

      try {
        event = await eventModel.findOne({ uuid: ctx.params.id });
        if (!event) {
          ctx.throw(404, `Event with ID ${ctx.params.id} doesn't exist`);
        }
        eventModel.assign(event, ctx.request.body);
        await eventModel.persistAndFlush(event);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse event schema: ${err}`);
      }

      // if updated
      ctx.status = 204;
    },
  });

  eventsRouter.route({
    meta: {
      swagger: {
        operationId: 'DeleteEvent',
        summary: 'Endpoint to DELETE a single event by ID.',
        required: true,
      },
    },
    method: 'delete',
    path: '/events/:id',
    pre: thisUser.can('access admin pages'),
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving event with id ${ctx.params.id}.`);
      let event;

      try {
        event = await eventModel.findOne({ uuid: ctx.params.id });
        if (!event) {
          ctx.throw(404, `Event with ID ${ctx.params.id} doesn't exist`);
        }
        await eventModel.removeAndFlush(event);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse event schema: ${err}`);
      }

      // if deleted
      ctx.status = 204;
    },
  });

  return eventsRouter;
}
