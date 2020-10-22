import Strategy from 'passport-strategy';
import { createRandomOrcid } from './orcid.js';

// a mock strategy for authenticating users
// in the non-production environment

export default class MockStrategy extends Strategy {
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
