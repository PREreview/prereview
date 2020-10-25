import passport from 'koa-passport';
import { Strategy as OrcidStrategy } from 'passport-orcid';
import MockStrategy from '../utils/mockStrategy.js';
import { getLogger } from '../log.js';
import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:auth');

export default function controller(users, config, thisUser) {
  const authRouter = router();
  log.debug('Authenticating user...');

  /**
   * Serialize user
   *
   * @param {Object} user - User info
   * @param {function} done - 'Done' callback
   */
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  /**
   * Deserialize user from session
   *
   * @param {integer} id - User id
   * @param {function} done - 'Done' callback
   */
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await users.findById(id);
      done(null, user);
    } catch (err) {
      log.debug();
      done(err);
    }
  });

  // defining ORCID auth callback
  // see https://members.orcid.org/api/oauth/refresh-tokens
  const verifyCallback = async (
    req,
    accessToken,
    refreshToken,
    params,
    profile,
    done,
  ) => {
    if (req && req.session && req.session.cookie && params.expires_in) {
      req.session.cookie.expires = new Date(
        Date.now() + params.expires_in * 1000,
      );
    }
    try {
      // prolly depends on how the user model would look
      const user = await users.findOrCreateUser({ orcid: params.orcid });
      log.debug('passport.use, username: ', user);
      if (user) {
        log.debug('Authenticated user!');
        done(null, user);
      } else {
        done(null, false);
      }
    } catch (err) {
      log.debug('Error authenticating: ', err);
      done(err);
    }
  };

  /**
   * Initialize passport strategy
   *
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {function} done - 'Done' callback
   */

  let strategy;
  const callbackURL = `${config.appRootUrl ||
    process.env.APP_ROOT_URL ||
    'http://127.0.0.1:3000'}/api/v2/auth/orcid/callback`;

  if (process.env.NODE_ENV === 'production') {
    strategy = new OrcidStrategy(
      {
        sandbox: false,
        state: true,
        clientID: config.orcidClientId || process.env.ORCID_CLIENT_ID,
        clientSecret:
          config.orcidClientSecret || process.env.ORCID_CLIENT_SECRET,
        callbackURL,
        passReqToCallback: true,
      },
      verifyCallback,
    );
  } else {
    strategy = new MockStrategy('orcid', callbackURL, verifyCallback);
  }

  passport.use(strategy);

   // start ORCID authentication
  authRouter.get('auth/orcid/login', passport.authenticate('orcid'))

   //finish ORCID authentication
  authRouter.route({
    method: 'get',
    path: 'auth/orcid/callback',
    handler: async ctx => {
      log.debug('Finishing authenticating with ORCID...')
      return passport.authenticate('orcid', (err, user) => {

        if (!user) {
          ctx.body = { success: false };
          ctx.throw(401, 'Authentication failed.');
        } else {
          ctx.state.user = user;

          if (ctx.request.body.remember === 'true') {
            ctx.session.maxAge = 86400000; // 1 day
          } else {
            ctx.session.maxAge = 'session';
          }

          ctx.cookies.set('PRE_user', user.username, { httpOnly: false });
          ctx.body = { success: true, user: user };
          log.debug('Orcid Callback user:', user);
          ctx.login(user);
          return ctx.redirect('/admin');
        }
      })(ctx);
    },
  })

   // TODO: figure out non-ORCID login/authentication

  // authRouter.route({
  //   method: 'post',
  //   path: '/login', 
  //   handler: async ctx => {
  //     return passport.authenticate('orcid', (err, user) => {
  //       if (!user) {
  //         ctx.body = { success: false };
  //         ctx.throw(401, 'Authentication failed.');
  //       } else {
  //         ctx.state.user = user;
  //         if (ctx.request.body.remember === 'true') {
  //           ctx.session.maxAge = 86400000; // 1 day
  //         } else {
  //           ctx.session.maxAge = 'session';
  //         }
  //         ctx.cookies.set('PRE_user', user.username, { httpOnly: false });
  //         ctx.body = {
  //           success: true,
  //           user: user,
  //         };
  //         return ctx.login(user);
  //       }
  //     })(ctx);
  //   }
  // });

  authRouter.route({
    method: 'get',
    path: '/logout',
    handler: async ctx => {
      log.debug("Logging out...")
      if (ctx.isAuthenticated()) {
        ctx.logout()
        ctx.session = null 
        ctx.cookies.set('PRE_user', '');
        ctx.redirect('/')
      } else {
        ctx.body = { success: false }
        ctx.throw(401, 'Logout failed')
      }
    }
  })

  /**
   * Authentication required
   *
   * @param {Object} auth - Authentication middleware
   * @param {Object} ctx - Koa context object
   */
  authRouter.get(
    '/authenticated',
    thisUser.can('access private pages'),
    async ctx => {
      ctx.body = { msg: 'Authenticated', user: ctx.state.user.id };
    },
  );

   return authRouter
}
