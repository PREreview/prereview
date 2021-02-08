import router from 'koa-joi-router';
import { getLogger } from '../log.js';
import { getErrorMessages } from '../utils/errors';

const log = getLogger('backend:controller:template');
const Joi = router.Joi;

const querySchema = Joi.object({
  limit: Joi.number()
    .integer()
    .greater(-1),
  offset: Joi.number()
    .integer()
    .greater(-1),
  desc: Joi.boolean(),
});

const templateSchema = Joi.object({
  title: Joi.string().required(),
  contents: Joi.string().required(),
});

const handleInvalid = ctx => {
  log.debug('Validation error!');
  log.error('Error details ', ctx.invalid);
  ctx.status = 400;
  ctx.message = getErrorMessages(ctx.invalid);
};

// eslint-disable-next-line no-unused-vars
export default function controller(templateModel, communityModel, thisUser) {
  const templatesRouter = router();

  // handler for GET multiple templates
  const getHandler = async ctx => {
    let templates, cid; // cid = community ID

    ctx.params.cid ? (cid = ctx.params.cid) : null;

    try {
      if (cid) {
        log.debug(`Retrieving templates related to review ${cid}.`);
        templates = await templateModel.find({ community: cid });
      } else {
        log.debug(`Retrieving all templates.`);
        templates = await templateModel.findAll();
      }
    } catch (err) {
      log.error('HTTP 400 error: ', err);
      ctx.throw(400, `Failed to retrieve templates`);
    }

    ctx.response.body = {
      status: 200,
      message: 'ok',
      data: templates,
    };
    ctx.status = 200;
  };

  const postHandler = async ctx => {
    if (ctx.invalid) {
      handleInvalid(ctx);
      return;
    }
    let community, template, cid;

    ctx.params.cid ? (cid = ctx.params.cid) : null;

    try {
      if (cid) {
        community = await communityModel.findOne(cid);
      }
    } catch (err) {
      log.error(`HTTP 400 error: ${err}`);
      ctx.throw(400, `Failed to retrieve community`);
    }

    try {
      if (community) {
        log.debug('Creating a community template');
        template = templateModel.create({
          ...ctx.request.body,
          community: community,
        });
        community.templates.add(template);
        await templateModel.persistAndFlush(template);
        ctx.body = {
          status: 201,
          message: 'created',
          body: template,
        };

        ctx.status = 201;
        return;
      }
    } catch (err) {
      log.error(`HTTP 400 error: ${err}`);
      ctx.throw(400, `Failed to create community template`);
    }

    try {
      log.debug('Creating a template');
      template = templateModel.create(ctx.request.body);
      await templateModel.persistAndFlush(template);
    } catch (err) {
      log.error(`HTTP 400 error: ${err}`);
      ctx.throw(400, `Failed to create template`);
    }

    ctx.body = {
      status: 201,
      message: 'created',
      data: template,
    };

    ctx.status = 201;
  };

  templatesRouter.route({
    method: 'GET',
    path: '/templates',
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    validate: {
      query: querySchema,
      continueOnError: true,
    },
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }
      await getHandler(ctx);
    },
    meta: {
      swagger: {
        operationId: 'GetTemplates',
        summary: 'Endpoint to GET all templates on all communities.',
      },
    },
  });

  templatesRouter.route({
    method: 'GET',
    path: '/communities/:cid/templates',
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    validate: {
      query: querySchema,
    },
    handler: async ctx => await getHandler(ctx),
    meta: {
      swagger: {
        operationId: 'GetCommunityTemplates',
        summary:
          'Endpoint to GET all templates related to a specific community.',
      },
    },
  });

  templatesRouter.route({
    method: 'POST',
    path: '/communities/:cid/templates',
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    validate: {
      body: templateSchema,
      type: 'json',
      continueOnError: true,
    },
    handler: postHandler,
    meta: {
      swagger: {
        operationId: 'PostCommunityTemplates',
        summary:
          'Endpoint to POST templates within a community on full-length reviews of preprints. Returns a 201 if a template has been successfully created.',
      },
    },
  });

  templatesRouter.route({
    method: 'POST',
    path: '/templates',
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    validate: {
      body: templateSchema,
      type: 'json',
      continueOnError: true,
    },
    handler: postHandler,
    meta: {
      swagger: {
        operationId: 'PostTemplates',
        summary:
          'Endpoint to POST templates on full-length reviews of preprints. Returns a 201 if a template has been successfully created.',
      },
    },
  });

  templatesRouter.route({
    method: 'GET',
    path: '/templates/:id',
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    validate: {},
    handler: async ctx => {
      log.debug(`Retrieving template ${ctx.params.id}.`);
      let template;

      try {
        template = await templateModel.findOne({ uuid: ctx.params.id });

        if (!template) {
          ctx.throw(404, `template with ID ${ctx.params.id} doesn't exist`);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse template schema: ${err}`);
      }

      ctx.response.body = {
        status: 200,
        message: 'ok',
        data: [template],
      };
      ctx.status = 200;
    },
    meta: {
      swagger: {
        operationId: 'GetTemplate',
        summary: 'Endpoint to GET a specific template.',
        required: true,
      },
    },
  });

  templatesRouter.route({
    method: 'PUT',
    path: '/templates/:id',
    // pre: {},
    validate: {
      body: templateSchema,
      type: 'json',
      continueOnError: true,
    },
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }

      log.debug(`Updating template ${ctx.params.id}.`);
      let template;

      try {
        template = await templateModel.findOne({ uuid: ctx.params.id });

        if (!template) {
          ctx.throw(404, `A template with ID ${ctx.params.id} doesn't exist`);
        }

        templateModel.assign(template, ctx.request.body);
        await templateModel.persistAndFlush(template);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse template schema: ${err}`);
      }

      // if updated
      ctx.body = {
        status: 204,
        message: 'updated',
        data: template,
      };
      ctx.status = 204;
    },
    meta: {
      swagger: {
        operationId: 'PutTemplate',
        summary: 'Endpoint to PUT changes on a specific template.',
        require: true,
      },
    },
  });

  templatesRouter.route({
    meta: {
      swagger: {
        operationId: 'DeleteTemplate',
        summary: 'Endpoint to DELETE a template.',
      },
    },
    method: 'DELETE',
    path: '/templates',
    pre: (ctx, next) => thisUser.can('access admin pages')(ctx, next),
    validate: {
      query: {
        id: Joi.string()
          .description('Template id')
          .required(),
      },
      type: 'json',
      continueOnError: true,
    },
    handler: async ctx => {
      log.debug(`Removing template with ID ${ctx.query.id}`);
      let template;

      try {
        template = await templateModel.findOne({ uuid: ctx.query.id });

        if (!template) {
          ctx.throw(404, `A template with ID ${ctx.query.id} doesn't exist`);
        }

        await templateModel.removeAndFlush(template);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse template schema: ${err}`);
      }

      // if deleted
      ctx.status = 204;
    },
  });

  return templatesRouter;
}
