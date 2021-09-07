import Roles from 'koa-roles';
import { isString } from 'lodash';
import { ORCID as orcidUtils } from 'orcid-utils';
import config from '../config.ts';
import { getLogger } from '../log.js';

const log = getLogger('backend:middleware:auth');

/**
 * Installs authorization middleware into the koa app.
 *
 * @param {Object} ctx - the koa context object
 * @param {funtion} next - continue to next middleware
 */

const authWrapper = (users, groups, communities, personas) => {
  const roles = new Roles();

  roles.getUser = async ctx => {
    log.debug('Retrieving current user.');

    if (ctx.isAuthenticated() && ctx.state.user) {
      log.debug('Returning logged in user.');
      return ctx.state.user;
    }

    try {
      const app = ctx.headers['x-api-app'];
      const key = ctx.headers['x-api-key'];
      if (app && key) {
        return users.findOneByKey(app, key);
      }
    } catch (error) {
      log.debug('No matching API key found:', error);
    }

    log.debug('No authenticated user or valid API key found.');
    return;
  };

  roles.isMemberOf = async (group, id) => {
    log.debug(`Checking if ${id} is a member of ${group}.`);
    if (
      config.adminUsers &&
      group === 'admins' &&
      isString(id) &&
      orcidUtils.isValid(id)
    ) {
      return (
        config.adminUsers.includes(id) ||
        (await groups.isMemberOf('admins', id))
      );
    } else {
      return groups.isMemberOf(group, id);
    }
  };

  roles.isMemberOfCommunity = async (community, id) => {
    log.debug(`Checking if ${id} is a member of ${community}.`);
    return communities.isMemberOf(community, id);
  };

  roles.isOwnerOfCommunity = async (community, id) => {
    log.debug(`Checking if ${id} is an owner of ${community}.`);
    return communities.isOwnerOf(community, id);
  };

  roles.isIdentityOf = async (persona, id) => {
    log.debug(`Checking if ${id} is the identity of ${persona}.`);
    return personas.isIdentityOf(persona, id);
  };

  roles.use('access private pages', async ctx => {
    log.debug('Checking if user is authenticated...');
    const user = await roles.getUser(ctx);
    log.debug('User is authenticated:', !!user);
    return !!user;
  });

  roles.use('access moderator pages', async ctx => {
    log.debug('Checking if user can access moderator pages.');
    const user = await roles.getUser(ctx);
    if (!user) return false;

    return (
      (await roles.isMemberOf('moderators', user.orcid)) ||
      (await roles.isMemberOf('admins', user.orcid))
    );
  });

  roles.use('access admin pages', async ctx => {
    log.debug('Checking if user can access admin pages.');
    const user = await roles.getUser(ctx);
    if (!user) return false;

    return roles.isMemberOf('admins', user.orcid);
  });

  roles.use('access this community', async ctx => {
    log.debug('Checking if user can edit this community.');
    const user = await roles.getUser(ctx);
    if (!user) return false;

    const isAdmin = await roles.isMemberOf('admins', user.orcid);
    if (isAdmin) return true;

    if (ctx.state.community) {
      return roles.isMemberOfCommunity(ctx.state.community, user.orcid);
    } else {
      return false;
    }
  });

  roles.use('edit this community', async ctx => {
    log.debug('Checking if user can edit this community.');
    const user = await roles.getUser(ctx);
    if (!user) return false;

    const isAdmin = await roles.isMemberOf('admins', user.orcid);
    if (isAdmin) return true;

    if (ctx.state.community) {
      return roles.isOwnerOfCommunity(ctx.state.community, user.orcid);
    } else {
      return false;
    }
  });

  roles.use('edit this persona', async ctx => {
    log.debug('Checking if user can edit this persona.');
    const user = await roles.getUser(ctx);
    if (!user) return false;

    const isAdmin = await roles.isMemberOf('admins', user.orcid);
    if (isAdmin) return true;

    if (ctx.state.persona) {
      return roles.isIdentityOf(ctx.state.persona, user.orcid);
    } else {
      return false;
    }
  });

  roles.use('edit this user', async ctx => {
    log.debug('Checking if user can edit this user.');
    const user = await roles.getUser(ctx);
    if (!user) return false;

    const isAdmin = await roles.isMemberOf('admins', user.orcid);
    if (isAdmin) return true;

    if (ctx.state.identity) {
      return (
        user.uuid === ctx.state.identity || user.orcid === ctx.state.identity
      );
    } else {
      return false;
    }
  });

  return roles;
};

export default authWrapper;
