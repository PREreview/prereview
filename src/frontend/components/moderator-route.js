import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import { UserContext } from '../contexts/user-context';
import NotFound from './not-found';

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated and 404 if
// you are not a moderator
export default function ModeratorRoute({ children, ...rest }) {
  const user = useContext(UserContext);
  const [isMod, setIsMod] = useState(false)
  user ? console.log("moderator user***********", user) : console.log("nope no user here")

  useEffect(() => {
    if (user && user.isModerator) {
      setIsMod(true);
    }
  }, []);

  return (
    <Route {...rest}>
      {user && isMod ? (
          children
        ) : (
          <NotFound />
        )
      
      }
    </Route>
  );
}

ModeratorRoute.propTypes = {
  children: PropTypes.any.isRequired,
};
