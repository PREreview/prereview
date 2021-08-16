// base imports
import React from 'react';
import PropTypes from 'prop-types';

import { default as MuiAvatar } from '@material-ui/core/Avatar';
import gravatar from 'gravatar';

//const useStyles = makeStyles(() => ({
//  profile: {
//    height: 220,
//    width: 220,
//    fontSize: '2.5em',
//  },
//  selector: {
//    height: 30,
//    width: 30,
//  },
//  corner: {
//    height: 28,
//    width: 28,
//    fontSize: '.9em',
//  },
//}));

const Avatar = ({ src, email, name = '', className, ref }) => {
  //const classes = useStyles();
  // const binary = new Uint8Array(avatar);
  // const blob = new Blob([avatar]);
  // const src = URL.createObjectURL(blob);
  // const src = JSON.stringify(avatar);
  if (src) {
    return <MuiAvatar src={src} className={className} alt="" ref={ref} />;
  }

  if (email) {
    src = gravatar.url(email, { protocol: 'https', d: '404', s: '100' });
  }
  return <MuiAvatar src={src} className={className} alt={name} ref={ref} />;
};

Avatar.propTypes = {
  avatar: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  email: PropTypes.string,
  personaName: PropTypes.string,
  className: PropTypes.string,
  ref: PropTypes.any,
};

export default Avatar;
