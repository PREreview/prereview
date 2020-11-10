import passport from 'koa-passport';
import { Strategy as OrcidStrategy } from 'passport-orcid';
// import MockStrategy from '../utils/mockStrategy.js';
import router from 'koa-joi-router';
import { getLogger } from '../log.js';
import merge from 'lodash.merge';

const log = getLogger('backend:controllers:auth');

export default function controller(users, config) {
  const authRouter = router();
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
      const user = await users.findOne(id);
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
    profile = {
      orcid: params.orcid,
      name: params.name,
      token: {
        access_token: params.access_token || accessToken,
        token_type: params.token_type,
        expires_in: params.expires_in,
      },
    };

    if (req && req.session && req.session.cookie && params.expires_in) {
      req.session.cookie.expires = new Date(
        Date.now() + params.expires_in * 1000,
      );
    }

    let user;

    try {
      user = await users.findOne({ orcid: params.orcid });
    } catch (err) {
      log.debug('Error fetching user.', err);
    }

    if (user) {
      const completeUser = merge(profile, user);
      log.debug('Authenticated user!', user, completeUser);
      return done(null, completeUser);
    } else {
      // mock user here
      const userInsert = {
        orcid: params.orcid,
        username: 'unique',
        email: 'unique@email.com',
        name: params.name,
      };

      let newUser;

      try {
        log.debug('User insert: ', userInsert);
        newUser = users.create(userInsert);
        await users.persistAndFlush(newUser);
      } catch (err) {
        log.debug('Error creating user.', err);
      }

      if (newUser) {
        log.debug('Authenticated & created user!', newUser);
        const completeUser = merge(profile, newUser);
        return done(null, completeUser);
      } else {
        return done(null, false);
      }
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

  strategy = new OrcidStrategy(
    {
      sandbox:
        config.orcid_sandbox ||
        process.env.PREREVIEW_ORCID_SANDBOX ||
        process.env.NODE_ENV !== 'production', // use the sandbox for non-production environments if not specified otherwise
      state: true, // needed for sessions
      clientID: config.orcid_client_id || process.env.PREREVIEW_ORCID_CLIENT_ID,
      clientSecret:
        config.orcid_client_secret || process.env.PREREVIEW_ORCID_CLIENT_SECRET,
      callbackURL: callbackURL,
      passReqToCallback: true,
    },
    verifyCallback,
  );

  // if (process.env.NODE_ENV === 'production') {
  //   strategy = new OrcidStrategy(
  //     {
  //       sandbox: false,
  //       state: true,
  //       clientID: config.orcidClientId || process.env.ORCID_CLIENT_ID,
  //       clientSecret:
  //         config.orcidClientSecret || process.env.ORCID_CLIENT_SECRET,
  //       callbackURL,
  //       passReqToCallback: true,
  //     },
  //     verifyCallback,
  //   );
  // } else {
  //   strategy = new MockStrategy('orcid', callbackURL, verifyCallback);
  // }

  passport.use(strategy);

  // start ORCID authentication
  authRouter.get('/auth/orcid/login', passport.authenticate('orcid'));

  //finish ORCID authentication
  authRouter.route({
    method: 'get',
    path: '/auth/orcid/callback',
    handler: async ctx => {
      return passport.authenticate('orcid', (err, user) => {
        log.debug('Finishing authenticating with ORCID...');
        if (!user) {
          ctx.body = { success: false };
          ctx.throw(401, 'Authentication failed.');
        } else {
          ctx.state.user = user;

          if (ctx.request.body.remember === 'true') {
            ctx.session.maxAge = 86400000; // 1 day
            log.debug(ctx.cookies);
          } else {
            ctx.session.maxAge = 'session';
          }

          ctx.cookies.set('PRE_user', user.username, { httpOnly: false });
          ctx.body = { success: true, user: user };
          log.debug(ctx.body);
          log.debug('Orcid Callback user:', user);

          try {
            ctx.login(user);
            return ctx.redirect('/');
          } catch (err) {
            ctx.throw(401, err);
          }
        }
      })(ctx);
    },
  });

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
      log.debug('Logging out...');
      if (ctx.isAuthenticated()) {
        ctx.logout();
        ctx.session = null;
        ctx.cookies.set('PRE_user', '');
        ctx.redirect('/');
      } else {
        ctx.body = { success: false };
        ctx.throw(401, 'Logout failed');
      }
    },
  });

  /**
   * Authentication required
   *
   * @param {Object} auth - Authentication middleware
   * @param {Object} ctx - Koa context object
   */
  authRouter.get('/authenticated', async ctx => {
    ctx.state.user
      ? (ctx.body = { msg: 'Authenticated', user: ctx.state.user.id })
      : (ctx.body = { msg: 'No user has been authenticated' });
  });

  return authRouter;
}
