import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';

export const UserContext = React.createContext();

export function UserProvider({ user = null, children }) {
  const [thisUser, setThisUser] = useState(null);

  useEffect(() => {
    // if (!thisUser) return;
    const username = Cookies.get('PRE_user');
    if (username) {
      fetch(`api/v2/users/${username}`)
        .then(response => {
          if (response.status === 200) {
            return response.json();
          }
          throw new Error(response);
        })
        .then(result => {
          setThisUser(result.data);
          return result;
        })
        .catch(err => {
          console.log('Error: ', err.message);
        });
    }
  }, []);

  return (
    <UserContext.Provider value={[thisUser, setThisUser]}>
      {children}
    </UserContext.Provider>
  );
}

UserProvider.propTypes = {
  user: PropTypes.object,
  children: PropTypes.any,
};
