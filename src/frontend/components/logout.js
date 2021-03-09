// base imports
import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

// contexts
import UserProvider from '../contexts/user-context';

// components
import Loading from './loading';

// constants

export default function Logout() {
  const history = useHistory();
  const [thisUser, setThisUser] = useContext(UserProvider.context);

  useEffect(() => {
    if (thisUser) {
      fetch('/api/v2/logout')
        .then(response => {
          if (response.status === 200) {
            setThisUser(null);
            return history.push('/');
          }
          throw new Error(response.message);
        })
        .catch(error => alert(`An error occurred: ${error.message}`));
    } else {
      history.push('/');
    }
  }, []);

  return <Loading />;
}
