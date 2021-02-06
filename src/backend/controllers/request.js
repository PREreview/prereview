import router from 'koa-joi-router';
import { getLogger } from '../log.js';
import getActivePersona from '../utils/persona.js';

const log = getLogger('backend:controllers:requests');

// eslint-disable-next-line no-unused-vars
export default function controller(reqModel, thisUser) {
  const requestRouter = router();

  const getHandler = async ctx => {
    let requests, pid; // pid = preprint ID

    ctx.params.pid ? (pid = ctx.params.pid) : null;

    try {
      if (pid) {
        log.debug(`Retriving requests made for preprint ${pid}`);
        requests = await reqModel.find({ preprint: pid });
      } else {
        log.debug(`Retrieving all requests.`);
        requests = await reqModel.findAll();
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    ctx.body = {
      status: 200,
      message: 'ok',
      data: requests,
    };
    ctx.status = 200;
  };

  const postHandler = async ctx => {
    let request, pid, authorPersona; // pid = preprint ID

    ctx.params.pid ? (pid = ctx.params.pid) : null;

    authorPersona = getActivePersona(ctx.state.user);

    log.debug(`Adding a request.`);

    try {
      if (pid) {
        request = reqModel.create({ preprint: pid, author: authorPersona });
      } else {
        request = reqModel.create({
          preprint: ctx.request.body.preprint.id, // TODO: figure out ensuring preprint id gets passed this way
          author: authorPersona,
        });
      }
      await reqModel.persistAndFlush(request);
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to create request: ${err}`);
    }

    ctx.body = {
      status: 201,
      message: 'created',
    };
    ctx.status = 201;
  };

  requestRouter.route({
    meta: {
      swagger: {
        operationId: 'PostRequests',
        summary: 'Endpoint to POST a request for review.',
      },
    },
    method: 'POST',
    path: '/preprints/:pid/requests',
    pre: (ctx, next) => thisUser.can('access admin pages')(ctx, next),
    // validate: {},
    handler: postHandler,
  });

  requestRouter.route({
    meta: {
      swagger: {
        operationId: 'GetRequests',
        summary: 'Endpoint to GET all requests for review.',
      },
    },
    method: 'get',
    path: '/requests',
    // validate: {}
    handler: getHandler,
  });

  requestRouter.route({
    meta: {
      swagger: {
        operationId: 'GetPreprintRequests',
        summary:
          'Endpoint to GET all requests for review of a single preprint.',
        required: true,
      },
    },
    method: 'get',
    path: '/preprints/:pid/requests',
    //validate: {}
    handler: getHandler,
  });

  requestRouter.route({
    meta: {
      swagger: {
        operationId: 'GetRequest',
        summary: 'Endpoint to GET one request for review by ID.',
        required: true,
      },
    },
    method: 'get',
    path: '/requests/:id',
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving request with id ${ctx.params.id}.`);
      let request;

      try {
        request = await reqModel.findOne({ uuid: ctx.params.id }, [
          'author',
          'preprint',
        ]);
        if (!request) {
          ctx.throw(404, `Request with ID ${ctx.params.id} doesn't exist`);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse request schema: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: [request],
      };
      ctx.status = 200;
    },
  });

  requestRouter.route({
    meta: {
      swagger: {
        operationId: 'DeleteRequest',
        summary: 'Endpoint to DELETE one request for review by ID.',
        required: true,
      },
    },
    method: 'delete',
    path: '/requests/:id',
    pre: (ctx, next) => thisUser.can('access admin pages')(ctx, next),
    // validate: {},
    handler: async ctx => {
      log.debug(`Deleting request ${ctx.params.id}`);
      let toDelete;

      try {
        toDelete = await reqModel.findOne({ uuid: ctx.params.id });
        if (!toDelete) {
          ctx.throw(404, `Request with ID ${ctx.params.id} doesn't exist`);
        }
        await reqModel.removeAndFlush(toDelete);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse request schema: ${err}`);
      }
      // if deleted
      ctx.status = 204;
    },
  });

  return requestRouter;
}
