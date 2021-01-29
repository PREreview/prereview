// base imports
import React from 'react';
import PropTypes from 'prop-types';

const Avatar = ({ avatar, className }) => {
  // const binary = new Uint8Array(avatar);
  // const blob = new Blob([avatar]);
  // const src = URL.createObjectURL(blob);
  // const src = JSON.stringify(avatar);

  return <img src={avatar} className={className} alt="" aria-hidden="true" />;
};

Avatar.propTypes = {
  avatar: PropTypes.PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
  className: PropTypes.string,
};

export default Avatar;
