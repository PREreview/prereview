import { Middleware } from 'koa';

/**
 * Middleware shim to get current community and add it to context.
 */

type Community = {
  community: string | null
}

const currentCommunity = (): Middleware<Community> => {
  return async (ctx, next) => {
    const path = ctx.request.path.replace(/^\/+|\/+$/g, '').split('/');
    if (path[0] === 'api' && path[2] === 'communities') {
      ctx.state.community = path[3];
    } else {
      ctx.state.community = null;
    }
    await next();
  };
};

export default currentCommunity;
