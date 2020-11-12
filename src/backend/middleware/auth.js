import Roles from 'koa-roles';
import { getLogger } from '../log.js';

/**
 * Installs authorization middleware into the koa app.
 *
 * @param {Object} ctx - the koa context object
 * @param {funtion} next - continue to next middleware
 */

const log = getLogger('backend:middleware:auth');

const authWrapper = groups => {
  const roles = new Roles();

  roles.isMemberOf = (group, id) => {
    return groups.isMemberOf(group, id);
  };

  roles.use('access private pages', ctx => ctx.isAuthenticated());

  roles.use('access admin pages', () => {
    log.debug('Checking if user can access admin pages.');
    if (!ctx.isAuthenticated()) return false;

    return groups.isMemberOf('admins', ctx.state.user.id);
  });

  return roles;
};

export default authWrapper;
