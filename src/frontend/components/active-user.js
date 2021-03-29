import React from 'react';
import PropTypes from 'prop-types';

// Material UI components
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

export default function ActiveUser({ user }) {
  const userId = user.split(', ')[0];
  const name = user.split(', ')[1];

  return (
    <Typography component="div" variant="body2">
      <Link href={`/about/${userId}`}>{name}</Link>
    </Typography>
  );
}

ActiveUser.propTypes = {
  user: PropTypes.object.isRequired,
};
