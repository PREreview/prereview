import passport from 'koa-passport';
import { Strategy as OrcidStrategy } from 'passport-orcid';
import router from 'koa-joi-router';
import merge from 'lodash.merge';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:auth');

export default function controller(users, personas, config, thisUser) {
  const authRouter = router();

  passport.serializeUser((user, done) => {
    log.trace('serializeUser() user:', user);
    done(null, user.id);
  });

  /**
   * Deserialize user from session
   *
   * @param {integer} id - User id
   * @param {function} done - 'Done' callback
   */
  passport.deserializeUser(async (id, done) => {
    log.trace('deserializeUser() id:', id);
    try {
      const user = await users.findOne(id);
      log.trace('deserializeUser() user:', user);
      done(null, user);
    } catch (err) {
      log.error('Error deserializing user:', err);
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

    log.trace('verifyCallback() profile:', profile);

    let user;

    try {
      // if a user already exists
      user = await users.findOne({ orcid: params.orcid });
      log.trace('verifyCallback() user:', user);
    } catch (err) {
      log.error('Error fetching user:', err);
    }

    if (user) {
      console.log('***********************');
      console.log(req);
      console.log('***********************');
      console.log(params);
      console.log('***********************');
      const completeUser = merge(profile, user); // including the access.token in the user that gets sent to the passport serializer
      log.debug('Authenticated user:', completeUser);
      return done(null, completeUser);
    } else {
      let newUser;
      let usersName;

      params.name
        ? (usersName = params.name)
        : (usersName = 'Community member');

      try {
        log.debug('Creating new user.');
        newUser = users.create({ orcid: params.orcid, name: usersName });
        log.trace('verifyCallback() newUser:', newUser);
        await users.persistAndFlush(newUser);
      } catch (err) {
        log.error('Error creating user:', err);
      }

      // create personas
      if (newUser) {
        log.debug('Authenticated & created user:', newUser);
        let anonPersona;
        let defaultPersona;

        try {
          anonPersona = personas.create({
            name: 'Anonymous',
            identity: newUser,
          });
          defaultPersona = personas.create({
            name: usersName,
            identity: newUser,
          });

          await personas.persistAndFlush([anonPersona, defaultPersona]);
        } catch (err) {
          log.debug('Error creating personas.', err);
        }
      }

      if (newUser) {
        log.debug('Authenticated & created user.', newUser);
        const completeUser = merge(profile, newUser);
        log.trace('verifyCallback() new completeUser:', completeUser);
        return done(null, completeUser);
      } else {
        return done(null, false);
      }
    }
  };

  const strategy = new OrcidStrategy(
    {
      sandbox: config.orcidSandbox,
      state: true, // needed for sessions
      clientID: config.orcidClientId,
      clientSecret: config.orcidClientSecret,
      callbackURL: config.orcidCallbackUrl,
      passReqToCallback: true,
    },
    verifyCallback,
  );

  passport.use(strategy);

  // TODO: local strategy login

  // start ORCID authentication
  authRouter.get('/orcid/login', passport.authenticate('orcid'), req => {
    console.log('+++++++++++++++++++++++++');
    console.log(req);
    console.log('+++++++++++++++++++++++++');
  });

  //finish ORCID authentication
  authRouter.route({
    method: 'get',
    path: '/orcid/callback',
    handler: async ctx => {
      return passport.authenticate('orcid', (err, user) => {
        log.debug('Finishing authenticating with ORCID...');
        log.debug('Received user object: ', user);
        if (!user) {
          ctx.body = { success: false };
          log.error('Authentication failed.');
          ctx.throw(401, 'Authentication failed.');
        } else {
          ctx.state.user = user;

          if (ctx.request.body.remember === 'true') {
            ctx.session.maxAge = 86400000; // 1 day
          } else {
            ctx.session.maxAge = 'session';
          }

          log.debug(`Setting cookies for user ${ctx.state.user.name}`);
          ctx.cookies.set('PRE_user', ctx.state.user.orcid, {
            httpOnly: false,
          });
          ctx.body = { success: true, user: user };

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

  authRouter.route({
    method: 'get',
    path: '/logout',
    handler: async ctx => {
      log.debug('Starting log out.');
      if (ctx.isAuthenticated()) {
        log.debug('Finishing logging out.');
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
  authRouter.get(
    '/authenticated',
    thisUser.can('access private pages'),
    async ctx => {
      ctx.state.user
        ? (ctx.body = { msg: 'Authenticated', user: ctx.state.user })
        : (ctx.body = { msg: 'No user has been authenticated' });
    },
  );

  return authRouter;
}
