// base imports
import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import { useGetValidateContact } from '../hooks/api-hooks.tsx';

// Material UI components
import Link from '@material-ui/core/Link';

// components
import HeaderBar from './header-bar';
import Loading from './loading';

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
      <div>
        <HeaderBar thisUser={thisUser} />

        <Helmet>
          <title>{ORG} • Validate email</title>
        </Helmet>

        <div>
          <h1>Hey there is an error</h1>

          <p>
            Visit PREreview.org{' '}
            <Link href="/" color="primary">
              Homepage
            </Link>
          </p>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <HeaderBar thisUser={thisUser} />

        <Helmet>
          <title>{ORG} • Validate email</title>
        </Helmet>

        <div>
          <h1>Email {contact.value} successfully validated</h1>

          <p>
            Visit PREreview.org{' '}
            <Link href="/" color="primary">
              homepage
            </Link>
          </p>
        </div>
      </div>
    );
  }
}
