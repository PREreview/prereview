// base imports
import React, { useContext } from 'react';
import { Helmet } from 'react-helmet-async';

// contexts
import UserProvider from '../contexts/user-context';

// components
import HeaderBar from './header-bar';
import Org from './org';
import XLink from './xlink';

// constants
import { ORG } from '../constants';

export default function NotFound() {
  const [thisUser] = useContext(UserProvider.context);

  return (
    <div className="not-found">
      <HeaderBar thisUser={thisUser} />

      <Helmet>
        <title>{ORG} • Not Found</title>
      </Helmet>

      <div className="not-found__body">
        <h1>Not found</h1>

        <p>
          Visit <Org />{' '}
          <XLink to="/" href="/">
            Homepage
          </XLink>
        </p>
      </div>
    </div>
  );
}
