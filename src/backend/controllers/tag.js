import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:tags');
// const Joi = router.Joi;

// eslint-disable-next-line no-unused-vars
export default function controller(tagModel, thisUser) {
  const tagsRouter = router();

  tagsRouter.route({
    meta: {
      swagger: {
        operationId: 'PostTags',
        summary: 'Endpoint to POST a tag.',
      },
    },
    method: 'post',
    path: '/tags',
    // pre:thisUserthisUser.can('access admin pages'),
    // validate: {},
    handler: async ctx => {
      log.debug(`Adding a new tag.`);
      let tag;

      try {
        tag = tagModel.create(ctx.request.body);
        await tagModel.persistAndFlush(tag);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse tag schema: ${err}`);
      }

      ctx.body = {
        status: 201,
        message: 'created',
        data: [tag],
      };
      ctx.status = 201;
    },
  });

  tagsRouter.route({
    meta: {
      swagger: {
        operationId: 'GetTags',
        summary: 'Endpoint to GET all tags.',
      },
    },
    method: 'get',
    path: '/tags',
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving tags.`);
      let allTags;

      try {
        allTags = await tagModel.findAll(['preprints']);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse tag schema: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: allTags,
      };
      ctx.status = 200;
    },
  });

  tagsRouter.route({
    meta: {
      swagger: {
        operationId: 'GetTag',
        summary: 'Endpoint to GET a single tag by ID.',
        required: true,
      },
    },
    method: 'get',
    path: '/tags/:id',
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving tag with id ${ctx.params.id}.`);
      let tag;

      try {
        tag = await tagModel.findOne({ uuid: ctx.params.id }, ['preprints']);
        if (!tag) {
          ctx.throw(404, `tag with ID ${ctx.params.id} doesn't exist`);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse tag schema: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: [tag],
      };
      ctx.status = 200;
    },
  });

  tagsRouter.route({
    meta: {
      swagger: {
        operationId: 'PutTag',
        summary: 'Endpoint to PUT a single tag by ID.',
        required: true,
      },
    },
    method: 'put',
    path: '/tags/:id',
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Updating tag with id ${ctx.params.id}.`);
      let tag;

      try {
        tag = await tagModel.findOne({ uuid: ctx.params.id });
        if (!tag) {
          ctx.throw(404, `Tag with ID ${ctx.params.id} doesn't exist`);
        }
        tagModel.assign(tag, ctx.request.body);
        await tagModel.persistAndFlush(tag);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse tag schema: ${err}`);
      }

      // if updated
      ctx.status = 204;
    },
  });

  tagsRouter.route({
    meta: {
      swagger: {
        operationId: 'DeleteTag',
        summary: 'Endpoint to DELETE a single tag by ID.',
        required: true,
      },
    },
    method: 'delete',
    path: '/tags/:id',
    // pre: thisUser.can(''),
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving tag with id ${ctx.params.id}.`);
      let tag;

      try {
        tag = await tagModel.findOne({ uuid: ctx.params.id });
        if (!tag) {
          ctx.throw(404, `Tag with ID ${ctx.params.id} doesn't exist`);
        }
        await tagModel.removeAndFlush(tag);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse tag schema: ${err}`);
      }

      // if deleted
      ctx.status = 204;
    },
  });

  return tagsRouter;
}
