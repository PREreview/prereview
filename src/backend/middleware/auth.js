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

  roles.isMemberOf = (group, id) => {
    if (
      config.adminUsers &&
      group === 'admins' &&
      isString(id) &&
      orcidUtils.isValid(id)
    ) {
      return config.adminUsers.includes(id) || groups.isMemberOf('admins', id);
    } else {
      return groups.isMemberOf(group, id);
    }
  };

  roles.use('access private pages', ctx => {
    log.debug('Is user logged in?', ctx.isAuthenticated());
    return ctx.isAuthenticated();
  });

  roles.use('access admin pages', ctx => {
    log.debug('Checking if user can access admin pages.');
    if (!ctx.isAuthenticated()) return false;

    return groups.isMemberOf('admins', ctx.state.user.orcid);
  });

  return roles;
};

export default authWrapper;
