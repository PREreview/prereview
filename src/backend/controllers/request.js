import router from 'koa-joi-router';
import { getLogger } from '../log.ts';

const log = getLogger('backend:controllers:requests');

export default function controller(reqModel, preprintModel, thisUser) {
  const requestRouter = router();

  const getHandler = async ctx => {
    let requests, preprint; // pid = preprint ID

    if (ctx.params.pid) {
      try {
        preprint = await preprintModel.findOneByUuidOrHandle(ctx.params.pid);
      } catch (err) {
        log.error('HTTP 400 Error: Error fetching preprint');
        ctx.throw(400, 'Error fetching preprint');
      }
      if (!preprint) {
        log.error('HTTP 404 Error: Preprint not found');
        ctx.throw(404, 'Preprint not found');
      }
    }

    try {
      if (preprint) {
        log.debug(`Retriving requests made for preprint ${ctx.params.pid}`);
        requests = await reqModel.find({ preprint: preprint });
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
    let request, preprint; // pid = preprint ID

    if (ctx.params.pid) {
      preprint = await preprintModel.findOneByUuidOrHandle(ctx.params.pid);
    }

    if (!preprint) {
      log.error('HTTP 404 Error: Preprint not found');
      ctx.throw(404, 'Preprint not found');
    }
    const user = await thisUser.getUser(ctx);

    log.debug(`Adding a request.`);

    let isPreprintAuthor = false;
    if (
      ctx.query.isAuthor &&
      (await thisUser.isMemberOf('partners', user.orcid) ||
        await thisUser.isMemberOf('admins', user.orcid))
    ) {
      isPreprintAuthor = true;
    }

    try {
      preprint.isPublished = true;
      request = reqModel.create({
        preprint,
        author: user.defaultPersona,
        isPreprintAuthor,
      });
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
    pre: thisUser.can('access private pages'),
    // validate: {},
    handler: postHandler,
  });

  // requestRouter.route({
  //   meta: {
  //     swagger: {
  //       operationId: 'PostRequests',
  //     },
  //   },
  //   method: 'POST',
  //   path: '/requests',
  //   // pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
  //   handler: postHandler,
  // });

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
    pre: thisUser.can('access admin pages'),
    // pre: thisUser.can(''),
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
