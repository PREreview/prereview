import router from 'koa-joi-router';
import moment from 'moment';

import { getLogger } from '../log.js';
import { BadRequestError } from '../../common/errors.js';
import _ from 'lodash/core';

const log = getLogger('backend:controllers:user');
const Joi = router.Joi;

const query_schema = Joi.object({
  start: Joi.number()
    .integer()
    .greater(-1),
  end: Joi.number()
    .integer()
    .positive(),
  asc: Joi.boolean(),
  sort_by: Joi.string(),
  from: Joi.string(),
  to: Joi.string(),
  library: Joi.number()
    .integer()
    .positive(),
  group: Joi.number()
    .integer()
    .positive(),
});

/**
 * Initialize the user auth controller
 *
 * @param {Object} users - User model
 * @returns {Object} Auth controller Koa router
 */
export default function controller(users, thisUser) {
  const userRouter = router()

  userRouter.route({
    method: 'get',
    path: '/users', 
    pre: thisUser.can('access private pages'),
    validate: {
      query: query_schema
    },
    handler: async ctx => {
      log.debug(`Retrieving users.`);
      // mikro orm magic here 

    }
  });

  userRouter.route({
    method: 'get',
    path: '/users/:id', 
    pre: thisUser.can('access private pages'),
    validate: {
      params: Joi.object({
        id: Joi.integer()
      })
    },
    handler: async ctx => {
      log.debug(`Retrieving user ${ctx.params.id}.`);
      // mikro orm magic
  });

  userRouter.route({
    method: 'put',
    path: '/users/:id',
    validate: {
      body: {},
      type: 'json',
    },
    pre: thisUser.can('access private pages'), // TODO: can edit self only no?
    handler: async ctx => {
      log.debug(`Updating user ${ctx.params.id}.`);
      let user;

    
    }
  });

  userRouter.route({
    method: 'delete',
    path: '/users/:id', 
    pre: thisUser.can('access admin pages'), // TODO: can users delete their own account?
    handler: async ctx => {
      log.debug(`Deleting user ${ctx.params.id}.`);
    }
  });

  return userRouter;
}
