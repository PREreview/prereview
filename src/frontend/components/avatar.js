// base imports
import React from 'react';
import PropTypes from 'prop-types';

import { default as MuiAvatar } from '@material-ui/core/Avatar';

const Avatar = ({ avatar, className }) => {
  // const binary = new Uint8Array(avatar);
  // const blob = new Blob([avatar]);
  // const src = URL.createObjectURL(blob);
  // const src = JSON.stringify(avatar);

  return <MuiAvatar src={avatar} classes={className} alt="" />;
};

Avatar.propTypes = {
  avatar: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default Avatar;
