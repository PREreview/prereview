import { Middleware } from 'koa';

/**
 * Middleware shim to get current persona and add it to context.
 */

type Persona = {
  persona: string | null;
}

const currentPersona = (): Middleware<Persona> => {
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
