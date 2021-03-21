/**
 * Middleware shim to get current persona and add it to context.
 *
 * @param {Object} ctx - the koa context object
 * @param {function} next - continue to next middleware
 */

const currentPersona = () => {
  return async (ctx, next) => {
    const path = ctx.request.path.replace(/^\/+|\/+$/g, '').split('/');
    if (path[0] === 'api' && path[2] === 'personas') {
      ctx.state.persona = path[3];
    } else {
      ctx.state.persona = null;
    }
    await next();
  };
};

export default currentPersona;
