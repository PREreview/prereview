import router from 'koa-joi-router';
import { createDebuggerStatement } from 'typescript';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:tags');
// eslint-disable-next-line no-unused-vars
// const Joi = router.Joi;

// eslint-disable-next-line no-unused-vars
export default function controller(reqModel, thisUser) {
  const requestRouter = router();

  requestRouter.route({
    method: 'post',
    path: '/requests',
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Posting a request.`)
      let newReq, pid; // pid = preprint ID

      ctx.params.pid ? pid = ctx.params.pid : null

      try {
        newReq = reqModel.create(ctx.request.body) // need to figure out how the user ID is passed thru
        await reqModel.persistAndFlush(newReq)
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse schema: ${err}`);
      }

      ctx.body = {
        status: 201,
        message: 'created',
        data: [newReq]
      };
      ctx.status = 201
    }
  })

  requestRouter.route({
    method: 'get',
    path: '/requests',
    // pre: thisUser.can('')
    //validate: {}
    handler: async ctx => {
      log.debug(`Retrieving requests.`)
      let requests, pid; // pid = preprint ID

      ctx.params.pid ? pid = ctx.params.pid : null

      try {
        if (pid) {
          requests = await reqModel.find({ preprint: pid })
        } else {
          requests = await reqModel.findAll()
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: "ok",
        data: requests
      }
      ctx.status = 200
    }
  })

  requestRouter.route({
    method: 'get',
    path: '/requests/:id',
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving request with id ${ctx.params.id}.`);
      let request;

      try {
        request = await reqModel.findOne(ctx.params.id, ['author', 'preprint'])
        if (!request) {
          ctx.throw(404, `Request with ID ${ctx.params.id} doesn't exist`)
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
    }
  })

  requestRouter.route({
    method: 'delete',
    path: '/requests/:id',
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Deleting request ${ctx.params.id}`)
      let toDelete;
      
      try {
        toDelete = await reqModel.findOne(ctx.params.id)
        if (!toDelete) {
          ctx.throw(404, `Request with ID ${ctx.params.id} doesn't exist`)
        }
        await reqModel.removeAndFlush(toDelete)
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse request schema: ${err}`);
      }
      // if deleted
      ctx.status = 204;  
    }
  })

  return requestRouter;
}
