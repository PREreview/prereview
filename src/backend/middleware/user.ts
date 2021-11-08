import { Middleware } from 'koa';

/**
 * Middleware shim to get current user and add it to context.
 */

type User = {
  identity: string | null;
}

const currentUser = (): Middleware<User> => {
  return async (ctx, next) => {
    const path = ctx.request.path.replace(/^\/+|\/+$/g, '').split('/');
    if (path[0] === 'api' && path[2] === 'users') {
      ctx.state.identity = path[3]; // don't collide with logged-in user state
    } else {
      ctx.state.identity = null;
    }
    await next();
  };
};

export default currentUser;
