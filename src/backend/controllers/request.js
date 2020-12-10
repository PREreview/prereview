import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:tags');

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
    let request, pid, author; // pid = preprint ID

    ctx.params.pid ? (pid = ctx.params.pid) : null;

    author = await ctx.state.user.personas.init({ where: { isActive: true } });

    log.debug(`Adding a request.`);

    try {
      if (pid) {
        request = reqModel.create({ preprint: pid, author: author });
      } else {
        request = reqModel.create({
          preprint: ctx.request.body.preprint,
          author: author,
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
    path: 'preprints/:pid/requests',
    // pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    // validate: {},
    handler: async ctx => postHandler(ctx),
  });

  requestRouter.route({
    meta: {
      swagger: {
        operationId: 'PostRequests',
      },
    },
    method: 'POST',
    path: '/requests',
    // pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    handler: async ctx => postHandler(ctx),
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
    handler: async ctx => getHandler(ctx),
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
    handler: async ctx => getHandler(ctx),
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
        request = await reqModel.findOne(ctx.params.id, ['author', 'preprint']);
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
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Deleting request ${ctx.params.id}`);
      let toDelete;

      try {
        toDelete = await reqModel.findOne(ctx.params.id);
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
