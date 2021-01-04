import React from 'react';
import PropTypes from 'prop-types';

export const UserContext = React.createContext();

export function UserProvider({ user = null, children }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

UserProvider.propTypes = {
  user: PropTypes.object,
  children: PropTypes.any,
};
