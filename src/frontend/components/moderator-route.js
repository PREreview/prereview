import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import { useUser } from '../contexts/user-context';
import NotFound from './not-found';

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated and 404 if
// you are not a moderator
export default function ModeratorRoute({ children, ...rest }) {
  const [user] = useUser();

  return (
    <Route {...rest}>
      {user ? (
        user.role && user.role.isModerator && !user.role.isModerated ? (
          children
        ) : (
          <NotFound />
        )
      ) : (
        <Redirect to="/login" />
      )}
    </Route>
  );
}

ModeratorRoute.propTypes = {
  children: PropTypes.any.isRequired,
};
