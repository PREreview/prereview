import Roles from 'koa-roles';
import orcidUtils from 'orcid-utils';
import config from '../config.ts';
import { isString } from '../../common/utils/strings';
import { getLogger } from '../log.js';

const log = getLogger('backend:middleware:auth');

/**
 * Installs authorization middleware into the koa app.
 *
 * @param {Object} ctx - the koa context object
 * @param {funtion} next - continue to next middleware
 */

const authWrapper = (groups, communities, personas) => {
  const roles = new Roles();

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

  roles.use('access private pages', ctx => {
    log.debug('Is user logged in?', ctx.isAuthenticated());
    return ctx.isAuthenticated();
  });

  roles.use('access moderator pages', async ctx => {
    log.debug('Checking if user can access moderator pages.');
    if (!ctx.isAuthenticated()) return false;

    return (
      (await roles.isMemberOf('moderators', ctx.state.user.orcid)) ||
      (await roles.isMemberOf('admins', ctx.state.user.orcid))
    );
  });

  roles.use('access admin pages', async ctx => {
    log.debug('Checking if user can access admin pages.');
    if (!ctx.isAuthenticated()) return false;

    return roles.isMemberOf('admins', ctx.state.user.orcid);
  });

  roles.use('edit this community', async ctx => {
    log.debug('Checking if user can edit this community.');
    if (!ctx.isAuthenticated()) return false;

    const isAdmin = await roles.isMemberOf('admins', ctx.state.user.orcid);
    if (isAdmin) return true;

    console.log('ctx.state.community:', ctx.state.community);
    console.log('ctx.state.user.orcid:', ctx.state.user.orcid);
    if (ctx.state.community) {
      return roles.isOwnerOfCommunity(
        ctx.state.community,
        ctx.state.user.orcid,
      );
    } else {
      return false;
    }
  });

  roles.use('edit this persona', async ctx => {
    log.debug('Checking if user can edit this persona.');
    if (!ctx.isAuthenticated()) return false;

    const isAdmin = await roles.isMemberOf('admins', ctx.state.user.orcid);
    if (isAdmin) return true;

    if (ctx.state.persona) {
      return roles.isIdentityOf(ctx.state.persona, ctx.state.user.orcid);
    } else {
      return false;
    }
  });

  roles.use('edit this user', async ctx => {
    log.debug('Checking if user can edit this user.');
    if (!ctx.isAuthenticated()) return false;

    const isAdmin = await roles.isMemberOf('admins', ctx.state.user.orcid);
    if (isAdmin) return true;

    if (ctx.state.identity) {
      return (
        ctx.state.user.uuid === ctx.state.identity ||
        ctx.state.user.orcid === ctx.state.identity
      );
    } else {
      return false;
    }
  });

  return roles;
};

export default authWrapper;
