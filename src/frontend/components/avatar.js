// base imports
import React from 'react';
import PropTypes from 'prop-types';

import { default as MuiAvatar } from '@material-ui/core/Avatar';
import { makeStyles } from '@material-ui/core/styles';
import gravatar from 'gravatar';

const useStyles = makeStyles(() => ({
  profile: {
    height: 220,
    width: 220,
    fontSize: '2.5em',
  },
  selector: {
    height: 30,
    width: 30,
  },
  corner: {
    height: 28,
    width: 28,
  },
}));

const Avatar = ({ avatar, email, personaName = '', className, ref }) => {
  const classes = useStyles();
  // const binary = new Uint8Array(avatar);
  // const blob = new Blob([avatar]);
  // const src = URL.createObjectURL(blob);
  // const src = JSON.stringify(avatar);
  if (avatar) {
    return (
      <MuiAvatar src={avatar} className={classes[className]} alt="" ref={ref} />
    );
  }

  console.log('email:', email);
  const src = gravatar.url(email, { protocol: 'https', d: '404', s: '100' });
  const names = personaName.split(' ');
  let initials;
  if (names.length >= 2) {
    initials = `${names[0].charAt(0)} ${names[names.length - 1].charAt(0)}`;
  }
  return (
    <MuiAvatar src={src} className={classes[className]} alt="avatar" ref={ref}>
      {initials}
    </MuiAvatar>
  );
};

Avatar.propTypes = {
  avatar: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  email: PropTypes.string,
  personaName: PropTypes.string,
  className: PropTypes.string,
  ref: PropTypes.any,
};

export default Avatar;
