import passport from 'koa-passport';
import { Strategy as OrcidStrategy } from 'passport-orcid';
import router from 'koa-joi-router';
import anonymus from 'anonymus';
import merge from 'lodash.merge';
import { getLogger } from '../log.js';
import { getOrcidPerson } from '../utils/orcid.js';

const log = getLogger('backend:controllers:auth');

const ANON_TRIES_LIMIT = 5;

export default function controller(
  users,
  personas,
  contacts,
  config,
  thisUser,
) {
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
        accessToken: params.access_token || accessToken,
        tokenType: params.token_type,
        expires_in: params.expires_in,
      },
    };

    log.debug('verifyCallback() req:', req);
    log.debug('verifyCallback() profile:', profile);

    let user;

    try {
      // if a user already exists
      user = await users.findOneByUuidOrOrcid(params.orcid, [
        'personas',
        'owned', //communities
        'groups',
      ]);
      log.debug('verifyCallback() user:', user);
    } catch (err) {
      log.error('Error fetching user:', err);
    }

    if (user) {
      const completeUser = merge(profile, user); // including the access.token in the user that gets sent to the passport serializer
      log.debug('Authenticated user: ', completeUser);
      return done(null, completeUser);
    } else {
      let newUser;
      let usersName;

      params.name
        ? (usersName = params.name)
        : (usersName = 'Community member');

      try {
        log.debug('Creating new user.');
        newUser = users.create({ orcid: params.orcid });
        log.debug('verifyCallback() newUser:', newUser);
      } catch (err) {
        log.error('Error creating user:', err);
      }

      // create personas
      if (newUser) {
        log.debug('Authenticated & created user:', newUser);
        let anonPersona;
        let publicPersona;

        let anonName = anonymus
          .create()[0]
          .replace(/(^|\s)\S/g, l => l.toUpperCase());
        let tries = 0;
        while ((await personas.findOne({ name: anonName })) !== null) {
          log.debug('Anonymous name generation collision');
          anonName = anonymus
            .create()[0]
            .replace(/(^|\s)\S/g, l => l.toUpperCase());
          tries = tries + 1;
          if (tries >= ANON_TRIES_LIMIT) {
            anonName = anonName + ` ${tries - ANON_TRIES_LIMIT}`;
          }
        }

        try {
          anonPersona = personas.create({
            name: anonName,
            identity: newUser,
            isAnonymous: true,
          });
          publicPersona = personas.create({
            name: usersName,
            identity: newUser,
            isAnonymous: false,
          });

          newUser.defaultPersona = anonPersona;
          personas.persist([anonPersona, publicPersona]);
          users.persist(newUser);
        } catch (err) {
          log.debug('Error creating personas.', err);
        }

        try {
          const fullProfile = await getOrcidPerson(
            profile.orcid,
            profile.token,
          );

          if (
            Array.isArray(fullProfile.emails.email) &&
            fullProfile.emails.email.length > 0
          ) {
            for (const e of fullProfile.emails.email) {
              let emailAddr;
              emailAddr = contacts.create({
                schema: 'mailto',
                value: e.email,
                identity: newUser,
                isVerified: !!e.isVerified,
                sendNotifications: false,
              });
              contacts.persist(emailAddr);
            }
          }
        } catch (err) {
          log.error(
            `Failed resolving user ${profile.orcid}'s emails from ORCID's 
            public API: ${err}.`,
          );
        }

        try {
          await users.em.flush();
          await personas.em.flush();
          await contacts.em.flush();
        } catch (err) {
          log.debug('Error saving user and personas to database.', err);
        }
      }

      if (newUser) {
        log.debug('Authenticated & created user.', newUser);
        const completeUser = merge(profile, { ...newUser, isNew: true });
        log.debug('verifyCallback() new completeUser:', completeUser);
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
  authRouter.get(
    '/orcid/login',
    (ctx, next) => {
      if (ctx.query.next) {
        ctx.session.next = ctx.query.next;
      } else {
        delete ctx.session.next;
      }
      next();
    },
    passport.authenticate('orcid'),
  );

  //finish ORCID authentication
  authRouter.route({
    method: 'GET',
    path: '/orcid/callback',
    handler: async ctx => {
      log.debug('/orcid/callback ctx.request:', ctx.request);
      return passport.authenticate('orcid', (err, user) => {
        log.debug('Receiving ORCiD callback.');
        if (!user) {
          log.error('Authentication failed: ', err);
          ctx.redirect('/login');
        } else {
          log.debug('Received user: ', user.uuid);
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

            if (user.isNew) {
              ctx.redirect('/settings');
              return;
            }

            if (ctx.session.next && !user.isNew) {
              ctx.redirect(ctx.session.next);
              delete ctx.session.next;
              return;
            }

            ctx.redirect('/');
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
