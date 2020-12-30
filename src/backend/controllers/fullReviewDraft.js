import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:fullReviewDrafts');
// eslint-disable-next-line no-unused-vars
const Joi = router.Joi;

// eslint-disable-next-line no-unused-vars
export default function controller(draftModel, thisUser) {
  const draftsRouter = router();

  const getHandler = async ctx => {
    let drafts, fid; // fid = fullReview ID
    if (ctx.params.fid) {
      fid = ctx.params.fid;
      log.debug(
        `Retrieving drafts associated with full review ID ${ctx.params.fid}`,
      );
    } else {
      log.debug(`Retrieving review drafts.`);
    }

    try {
      if (fid) {
        drafts = await draftModel.find({ parent: fid });
      } else {
        drafts = await draftModel.findAll();
      }
    } catch (error) {
      return ctx.throw(400, { message: error.message });
    }

    ctx.body = {
      status: 200,
      message: 'ok',
      data: drafts,
    };
    ctx.status = 200;
  };

  draftsRouter.route({
    method: 'post',
    path: '/fullReviewDrafts/',
    // pre:thisUserthisUser.can('access admin pages'),
    // validate: {
    //   body: {
    //     authors: Joi.array(),
    //     is_hidden: Joi.boolean(),
    //     content: Joi.array(),
    //   },
    //   type: 'json',
    //   failure: 400,
    // },
    handler: async ctx => {
      log.debug(`Adding a review draft.`);
      let draft;

      try {
        draft = draftModel.create(ctx.request.body);
        await draftModel.persistAndFlush(draft);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse schema: ${err}`);
      }

      ctx.body = {
        status: 201,
        message: 'created',
        data: [draft],
      };
      ctx.status = 201;
    },
  });

  draftsRouter.route({
    method: 'get',
    path: '/fullReviewDrafts/',
    // pre: thisUser.can('access admin pages'),
    // validate: {},
    handler: async ctx => getHandler(ctx),
  });

  draftsRouter.route({
    method: 'get',
    path: '/fullReviews/:fid/fullReviewDrafts/',
    // pre: thisUser.can('access admin pages'),
    // validate: {},
    handler: async ctx => getHandler(ctx),
  });

  draftsRouter.route({
    method: 'get',
    path: '/fullReviewDrafts/:id',
    // pre: thisUser.can('access admin pages'),
    // validate: {},
    handler: async ctx => {
      log.debug(`Retrieving draft with id ${ctx.params.id}.`);
      let draft;

      try {
        draft = await draftModel.findOne(ctx.params.id);
        if (!draft) {
          ctx.throw(404, `Draft with ID ${ctx.params.id} doesn't exist`);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse schema: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: [draft],
      };
      ctx.status = 200;
    },
  });

  draftsRouter.route({
    method: 'put',
    path: '/fullReviewDrafts/:id',
    // pre:thisUserthisUser.can('access admin pages'),
    // validate: {
    //   body: {
    //     authors: Joi.array(),
    //     is_hidden: Joi.boolean(),
    //     content: Joi.array(),
    //   },
    //   type: 'json',
    //   failure: 400,
    // },
    handler: async ctx => {
      log.debug(`Updating review draft ${ctx.params.id}.`);
      let draft;

      try {
        draft = await draftModel.findOne(ctx.params.id);
        if (!draft) {
          ctx.throw(404, `Draft with ID ${ctx.params.id} doesn't exist`);
        }
        draftModel.assign(draft, ctx.request.body);
        await draftModel.persistAndFlush(draft);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      ctx.status = 204;
    },
  });

  draftsRouter.route({
    method: 'delete',
    path: '/fullReviewDrafts/:id',
    // pre:thisUserthisUser.can('access admin pages'),
    handler: async ctx => {
      log.debug(`Deleting review draft ${ctx.params.id}.`);
      let draft;

      try {
        draft = await draftModel.findOne(ctx.params.id);
        if (!draft) {
          ctx.throw(404, `Draft with ID ${ctx.params.id} doesn't exist`);
        }
        await draftModel.removeAndFlush(draft);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      //if deleted
      ctx.status = 204;
    },
  });

  return draftsRouter;
}
