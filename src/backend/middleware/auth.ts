import { ParameterizedContext } from 'koa';
import Roles from 'koa-roles';
import { isString } from 'lodash';
import { ORCID as orcidUtils } from 'orcid-utils';
import config from '../config';
import { getLogger } from '../log';
import { CommunityModel, GroupModel, PersonaModel, UserModel } from '../models';
import { User } from '../models/entities';

const log = getLogger('backend:middleware:auth');

export type Auth = {
  can: Roles['can'];
  middleware: Roles['middleware'];
  getUser: (ctx: ParameterizedContext<{ user?: User }>) => Promise<User | null | undefined>;
  isIdentityOf: PersonaModel['isIdentityOf'];
  isMemberOf: GroupModel['isMemberOf'];
  isMemberOfCommunity: CommunityModel['isMemberOf'];
  isOwnerOfCommunity: CommunityModel['isOwnerOf'];
};

const authWrapper = (
  users: UserModel,
  groups: GroupModel,
  communities: CommunityModel,
  personas: PersonaModel,
): Auth => {
  const roles = new Roles();

  const getUser: Auth['getUser'] = async ctx => {
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

  const isMemberOf: Auth['isMemberOf'] = async (group, id) => {
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

  const isMemberOfCommunity: Auth['isMemberOfCommunity'] = async (
    community,
    id,
  ) => {
    log.debug(`Checking if ${id} is a member of ${community}.`);
    return communities.isMemberOf(community, id);
  };

  const isOwnerOfCommunity: Auth['isOwnerOfCommunity'] = async (
    community,
    id,
  ) => {
    log.debug(`Checking if ${id} is an owner of ${community}.`);
    return communities.isOwnerOf(community, id);
  };

  const isIdentityOf: Auth['isIdentityOf'] = async (persona, id) => {
    log.debug(`Checking if ${id} is the identity of ${persona}.`);
    return personas.isIdentityOf(persona, id);
  };

  roles.use('access private pages', async ctx => {
    log.debug('Checking if user is authenticated...');
    const user = await getUser(ctx);
    log.debug('User is authenticated:', !!user);
    return !!user;
  });

  roles.use('access moderator pages', async ctx => {
    log.debug('Checking if user can access moderator pages.');
    const user = await getUser(ctx);
    if (!user) return false;

    return (
      (await isMemberOf('moderators', user.orcid)) ||
      (await isMemberOf('admins', user.orcid))
    );
  });

  roles.use('access admin pages', async ctx => {
    log.debug('Checking if user can access admin pages.');
    const user = await getUser(ctx);
    if (!user) return false;

    return isMemberOf('admins', user.orcid);
  });

  roles.use('access this community', async ctx => {
    log.debug('Checking if user can edit this community.');
    const user = await getUser(ctx);
    if (!user) return false;

    const isAdmin = await isMemberOf('admins', user.orcid);
    if (isAdmin) return true;

    if (ctx.state.community) {
      return isMemberOfCommunity(ctx.state.community, user.orcid);
    } else {
      return false;
    }
  });

  roles.use('edit this community', async ctx => {
    log.debug('Checking if user can edit this community.');
    const user = await getUser(ctx);
    if (!user) return false;

    const isAdmin = await isMemberOf('admins', user.orcid);
    if (isAdmin) return true;

    if (ctx.state.community) {
      return isOwnerOfCommunity(ctx.state.community, user.orcid);
    } else {
      return false;
    }
  });

  roles.use('edit this persona', async ctx => {
    log.debug('Checking if user can edit this persona.');
    const user = await getUser(ctx);
    if (!user) return false;

    const isAdmin = await isMemberOf('admins', user.orcid);
    if (isAdmin) return true;

    if (ctx.state.persona) {
      return isIdentityOf(ctx.state.persona, user.orcid);
    } else {
      return false;
    }
  });

  roles.use('edit this user', async ctx => {
    log.debug('Checking if user can edit this user.');
    const user = await getUser(ctx);
    if (!user) return false;

    const isAdmin = await isMemberOf('admins', user.orcid);
    if (isAdmin) return true;

    if (ctx.state.identity) {
      return (
        user.uuid === ctx.state.identity || user.orcid === ctx.state.identity
      );
    } else {
      return false;
    }
  });

  return {
    can: roles.can.bind(roles),
    middleware: roles.middleware.bind(roles),
    getUser,
    isIdentityOf,
    isMemberOf,
    isMemberOfCommunity,
    isOwnerOfCommunity,
  };
};

export default authWrapper;
