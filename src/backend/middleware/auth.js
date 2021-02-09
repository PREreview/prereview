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

const authWrapper = groups => {
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

  return roles;
};

export default authWrapper;
