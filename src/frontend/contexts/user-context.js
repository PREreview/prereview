import React, { createContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';

// components
import Loading from '../components/loading';

// export const UserContext = React.createContext();
//
// export function UserProvider({ user = null, children }) {
//   const [user, setUser] = useState(null);
//   return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
// }
//
// UserProvider.propTypes = {
//   user: PropTypes.object,
//   children: PropTypes.any,
// };

const context = createContext(null);

export default function UserProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const username = Cookies.get('PRE_user');
    if (username) {
      fetch(`/api/v2/users/${username}`)
        .then(response => {
          if (response.status === 200) {
            return response.json();
          }
          throw new Error(response.message);
        })
        .then(result => {
          setUser(result.data);
          return setLoading(false);
        })
        .catch(err => {
          alert(`An error occurred: ${err.message}`);
          return setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <Loading />;
  } else {
    return (
      <context.Provider value={[user, setUser]}>{children}</context.Provider>
    );
  }
}

UserProvider.context = context;

UserProvider.propTypes = {
  children: PropTypes.any,
};
