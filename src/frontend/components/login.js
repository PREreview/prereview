// base imports
import React, { useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import { useHasAgreedCoC } from '../hooks/ui-hooks';

// components
import Button from './button';
import Checkbox from './checkbox';
import HeaderBar from './header-bar';
import Org from './org';
import XLink from './xlink';

// constants
import { ORG } from '../constants';

// TODO make clear that by logging in user accepts the code of conduct

export default function Login() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [hasAgreed, setHasAgreed] = useHasAgreedCoC();

  const location = useLocation();

  const [thisUser] = useContext(UserProvider.context);

  const next = new URLSearchParams(location.search).get('next');

  return (
    <div className="login">
      <Helmet>
        <title>{ORG} • Login</title>
      </Helmet>
      <HeaderBar thisUser={thisUser} />
      <div className="login__content">
        {/* <div className="login__logo-container">
          <AnimatedLogo />
        </div> */}

        <h2 className="login__header">
          To log in to <Org /> you will need an ORCID ID.
        </h2>

        <p className="login__text">
          Click below to sign in with your ORCID account, or create one if you
          don’t have one.
        </p>

        <div className="login__coc">
          <span className="login__checkbox">
            <Checkbox
              checked={hasAgreed}
              onChange={() => setHasAgreed(!hasAgreed)}
              label={
                <span>
                  I have read and agree to the <Org />{' '}
                  <XLink href="/code-of-conduct" to="/code-of-conduct">
                    Code of Conduct
                  </XLink>
                  .
                </span>
              }
            />
          </span>
        </div>

        <Button
          disabled={!hasAgreed}
          element={hasAgreed ? 'a' : 'button'}
          href={`/api/v2/orcid/login${
            next ? `?next=${encodeURIComponent(next)}` : ''
          }`}
          primary={true}
          className="login__login-button"
        >
          Sign in with ORCID
        </Button>
      </div>
    </div>
  );
}
