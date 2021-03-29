import React from 'react';
import PropTypes from 'prop-types';

// Material UI components
import Link from '@material-ui/core/Link';

export default function ActiveUser({ user }) {
  const userId = user.split(', ')[0];
  const name = user.split(', ')[1];

  return (
    <>
      <Link href={`/about/${userId}`}>{name}</Link>
    </>
  );
}

ActiveUser.propTypes = {
  user: PropTypes.object.isRequired,
};
