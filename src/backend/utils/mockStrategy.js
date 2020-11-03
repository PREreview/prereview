import Strategy from 'passport-strategy';
import { createRandomOrcid } from './orcid.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:utils:mockStrategy');

// a mock strategy for authenticating users
// in the non-production environment

export default class MockStrategy extends Strategy {
  constructor(name, callbackURL, verifyCallback) {
    super();
    this.name = name;
    this._callbackURL = callbackURL;
    this._verifyCallback = verifyCallback;
  }

  // eslint-disable-next-line no-unused-vars
  authenticate(req, options) {
    log.debug('In the mock authentication strategy.');
    const accessToken = 'accessToken';
    const refreshToken = 'refreshToken';
    const params = {
      orcid: createRandomOrcid(),
      username: 'anotherunique',
      name: 'Test User',
      email: 'bob@bob3.com',
      isAdmin: false, // in dev mode we create admin users
      isModerator: true,
      expires_in: 20 * 365 * 24 * 60 * 60, // in secs
    };
    const profile = {};

    if (req.url.split('?')[0] === '/orcid') {
      log.debug('In this condition in the mockStrategy...')
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
