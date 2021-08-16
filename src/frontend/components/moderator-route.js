import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import UserProvider from '../contexts/user-context';
import NotFound from './not-found';

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated and 404 if
// you are not a moderator
export default function ModeratorRoute({ children, ...rest }) {
  const [user] = useContext(UserProvider.context);
  const [isMod, setIsMod] = useState(false);

  useEffect(() => {
    if (user && user.isAdmin) { // #FIXME should this be isModerator ?
      setIsMod(true);
    }
  }, []);

  return <Route {...rest}>{user && isMod ? children : <NotFound />}</Route>;
}

ModeratorRoute.propTypes = {
  children: PropTypes.any.isRequired,
};
