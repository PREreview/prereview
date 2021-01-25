// base imports
import React from 'react';
import PropTypes from 'prop-types';

const Avatar = ({ avatar, className }) => {
  // const binary = new Uint8Array(avatar);
  // const blob = new Blob([avatar]);
  // const src = URL.createObjectURL(blob);
  // const src = JSON.stringify(avatar);

  const src = URL.createObjectURL(new Blob([avatar.data], { type: 'image/*' }));

  console.log(src);

  return <img src={src} className={className} alt="" aria-hidden="true" />;
};

Avatar.propTypes = {
  avatar: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default Avatar;
