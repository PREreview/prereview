import orcidUtils from 'orcid-utils';
import passport from 'passport';
import { Strategy as OrcidStrategy } from 'passport-orcid';
import Strategy from 'passport-strategy';
import fetch from 'node-fetch';
import DB from '../db/db';
import { getId, cleanup } from './jsonld';
import { createError } from './errors';
import { ADMIN_ORCIDS } from '../constants';

/**
 * See https://support.orcid.org/hc/en-us/articles/360006897674-Structure-of-the-ORCID-Identifier
 */
export function createRandomOrcid(nTry = 0) {
  const digits = Math.floor(Math.pow(10, 15) * Math.random()).toString();

  let total = 0;
  for (let i = 0; i < digits.length; i++) {
    total = (total + parseInt(digits[i], 10)) * 2;
  }
  const result = (12 - (total % 11)) % 11;
  const checkDigit = result === 10 ? 'X' : result.toString();

  const orcid = `${digits}${checkDigit}`;
  if (!orcidUtils.isValid(orcid) && nTry < 5) {
    return createRandomOrcid(++nTry);
  }

  return orcid;
}

export function createPassport(config) {
  const db = new DB(config);

  // see https://members.orcid.org/api/oauth/refresh-tokens
  function verifyCallback(
    req,
    accessToken,
    refreshToken,
    params,
    profile,
    done,
  ) {
    // `profile` is empty as ORCID has no generic profile URL,
    // so populate the profile object from the params instead
    const action = {
      '@type': 'RegisterAction',
      actionStatus: 'CompletedActionStatus',
      agent: {
        '@type': 'Person',
        orcid: params.orcid,
        name: params.name,
      },
      token: cleanup({
        '@type': 'AuthenticationToken',
        accessToken: params.access_token || accessToken,
        refreshToken,
        tokenType: params.token_type,
        expiresIn: params.expires_in, // in seconds
      }),
    };

    if (req && req.session && req.session.cookie && params.expires_in) {
      req.session.cookie.expires = new Date(
        Date.now() + params.expires_in * 1000,
      );
    }

    db.post(action, {
      isAdmin:
        ADMIN_ORCIDS.includes(orcidUtils.toDashFormat(params.orcid)) ||
        (process.env.NODE_ENV !== 'production' && params.isAdmin),
      isModerator:
        ADMIN_ORCIDS.includes(orcidUtils.toDashFormat(params.orcid)) ||
        (process.env.NODE_ENV !== 'production' && params.isModerator),
    })
      .then(action => {
        done(null, action.result);
      })
      .catch(done);
  }

  class MockStrategy extends Strategy {
    constructor(name, callbackURL, verifyCallback) {
      super();
      this.name = name;
      this._callbackURL = callbackURL;
      this._verifyCallback = verifyCallback;
    }

    authenticate(req, options) {
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';
      const params = {
        orcid: createRandomOrcid(),
        name: 'Test User',
        isAdmin: true, // in dev mode we create admin users
        isModerator: true,
        expires_in: 20 * 365 * 24 * 60 * 60, // in secs
      };
      const profile = {};

      if (req.url.split('?')[0] === '/orcid') {
        this.redirect(this._callbackURL);
      } else {
        this._verifyCallback(
          req,
          accessToken,
          refreshToken,
          params,
          profile,
          (err, user) => {
            this.success(user);
          },
        );
      }
    }
  }

  let strategy;
  const callbackURL = `${config.appRootUrl ||
    process.env.APP_ROOT_URL ||
    'http://127.0.0.1:3000'}/auth/orcid/callback`;

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

  passport.serializeUser(function(user, done) {
    done(null, getId(user));
  });

  passport.deserializeUser(function(userId, done) {
    db.get(userId, { user: userId, raw: true })
      .then(user => {
        delete user.token;
        if (user.contactPoint) {
          delete user.contactPoint.token;
        }
        done(null, user);
      })
      .catch(err => {
        done(
          createError(
            err.statusCode || 500,
            `Could not get user ${userId} (from cookie). Try deleting the rapid.sid cookie and try again. ${
              err.message
            }`,
          ),
        );
      });
  });

  passport.use(strategy);

  return passport;
}

/**
 * See https://members.orcid.org/api/tutorial/read-orcid-records
 */
export async function getOrcidProfile(orcid, token) {
  const r = await fetch(`https://pub.orcid.org/v2.1/${orcid}/person`, {
    headers: {
      Accept: 'application/json',
      Authorization: `${token.tokenType} ${token.accessToken}`,
    },
  });

  if (r.ok) {
    return await r.json();
  } else {
    throw createError(r.status);
  }
}
