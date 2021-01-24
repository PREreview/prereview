import React from 'react';
import PropTypes from 'prop-types';
import RoleBadge from './role-badge';

export default function UserBadge({ user, children, ...others }) {
  return (
    <RoleBadge {...others} user={user.defaultPersona ? user.defaultPersona : user}>
      {children}
    </RoleBadge>
  );
}

UserBadge.propTypes = {
  user: PropTypes.object.isRequired,
  children: PropTypes.any,
};
