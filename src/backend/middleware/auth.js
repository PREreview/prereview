import Roles from 'koa-roles';
import config from '../config.ts';
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
    log.debug('Hello in isMemberOf?');
    return groups.isMemberOf(group, id);
  };

  roles.use('access private pages', ctx => {
    log.debug('Is user logged in?', ctx.isAuthenticated());
    return ctx.isAuthenticated();
  });

  roles.use('access admin pages', ctx => {
    log.debug('Checking if user can access admin pages.');
    if (!ctx.isAuthenticated()) return false;

    return (
      config.adminUsers.includes(ctx.state.user.orcid) ||
      groups.isMemberOf('admins', ctx.state.user.id)
    );
  });

  return roles;
};

export default authWrapper;
