// base imports
import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import { useGetValidateContact } from '../hooks/api-hooks.tsx';

// components
import HeaderBar from './header-bar';
import Loading from './loading';
import Org from './org';
import XLink from './xlink';

// constants
import { ORG } from '../constants';

export default function NotFound() {
  const [thisUser] = useContext(UserProvider.context);

  const { token } = useParams();
  const { data: contact, loading, error } = useGetValidateContact({
    token: token,
    resolve: res => res.data,
  });

  if (loading) {
    return <Loading />;
  } else if (error) {
    return (
      <div className="not-found">
        <HeaderBar thisUser={thisUser} />

        <Helmet>
          <title>{ORG} • Validate email</title>
        </Helmet>

        <div className="not-found__body">
          <h1>Hey there is an error</h1>

          <p>
            Visit <Org />{' '}
            <XLink to="/" href="/">
              Homepage
            </XLink>
          </p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="not-found">
        <HeaderBar thisUser={thisUser} />

        <Helmet>
          <title>{ORG} • Validate email</title>
        </Helmet>

        <div className="not-found__body">
          <h1>Email {contact.value} successfully validated</h1>

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
}
