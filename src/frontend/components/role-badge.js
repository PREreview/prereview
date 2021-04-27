// base imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Tooltip from '@reach/tooltip';
import { useHistory } from 'react-router-dom';

// material UI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import MuiBadge from '@material-ui/core/Badge';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import MuiAvatar from '@material-ui/core/Avatar';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';

// icons
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

const Avatar = withStyles({
  root: {
    height: 28,
    width: 28,
  },
})(MuiAvatar);

const useStyles = makeStyles(theme => ({
  avatar: {
    border: '2px solid #fff',
    borderRadius: '50%',
  },
  box: {
    minHeight: 50,
    minWidth: 50,
    position: 'relative',
  },
  icon: {
    height: 12,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 12,
    zIndex: 10,
  },
  popover: {
    zIndex: '20000 !important',
  },
  popoverInner: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
  },
  tooltip: {
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    color: 'rgba(0, 0, 0, 0.8)',
    left: '50%',
    padding: 5,
    position: 'absolute',
    top: '90%',
    transform: 'translateX(-50%)',
    zIndex: '999',
  },
}));

const RoleBadge = React.forwardRef(function RoleBadge(
  { children, className, tooltip, showNotice, disabled, user, contacts },
  ref,
) {
  return (
    <RoleBadgeUI
      ref={ref}
      tooltip={tooltip}
      roleUser={user}
      contacts={contacts}
      className={className}
      showNotice={showNotice}
      disabled={disabled}
    >
      {children}
    </RoleBadgeUI>
  );
});

RoleBadge.propTypes = {
  tooltip: PropTypes.bool,
  user: PropTypes.object.isRequired,
  children: PropTypes.any,
  className: PropTypes.string,
  contacts: PropTypes.any,
  showNotice: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default RoleBadge;

/**
 * Non hooked version (handy for story book and `UserBadge`)
 */
const RoleBadgeUI = React.forwardRef(function RoleBadgeUI(
  { roleUser, contacts, children, tooltip, showNotice = false },
  ref,
) {
  // ****  USER IN THIS COMPONENT IS ACTUALLY A PERSONA OBJECT **** //

  const classes = useStyles();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = useState(null);
  const user = roleUser.defaultPersona ? roleUser.defaultPersona : roleUser;
  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'user-menu' : undefined;
  return (
    <>
      <Box className={classes.box}>
        <IconButton
          aria-describedby={id}
          variant="contained"
          color="primary"
          onClick={handleClick}
        >
          <Typography variant="srOnly">Open</Typography>
          <Tooltipify tooltip={tooltip} user={user}>
            {/* this badge is only visible if a user's profile is incomplete */}
            <MuiBadge badgeContent="!" color="primary" invisible={!showNotice}>
              <Avatar
                src={user.avatar}
                ref={ref}
                className={classes.avatar}
                alt={user.name}
              >
                {user.name.charAt(0)}
              </Avatar>
            </MuiBadge>
          </Tooltipify>
        </IconButton>
      </Box>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        className={classes.popover}
      >
        <div className={classes.popoverInner}>
          {user.reviewUuid ? (
            <Typography component="div">
              <Link href={user.reviewUuid}>
                {user && user.defaultPersona
                  ? `View ${user.defaultPersona.name}'s Review`
                  : `View ${user.name}'s Review`}
              </Link>
            </Typography>
          ) : null}
          <Typography component="div">
            <Link
              href={`/about/${
                user.defaultPersona ? user.defaultPersona.uuid : user.uuid
              }`}
            >
              {user && user.defaultPersona
                ? `View ${user.defaultPersona.name}'s Profile`
                : `View ${user.name}'s Profile`}
            </Link>
          </Typography>
          {children}
        </div>
      </Popover>
    </>
  );
});

RoleBadgeUI.propTypes = {
  showNotice: PropTypes.bool,
  tooltip: PropTypes.bool,
  roleUser: PropTypes.shape({
    defaultPersona: PropTypes.object,
    uuid: PropTypes.string,
    reviewUuid: PropTypes.string,
    identity: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    orcid: PropTypes.string,
    name: PropTypes.string,
    avatar: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  }),
  children: PropTypes.any,
  disabled: PropTypes.bool,
};

export { RoleBadgeUI };

function Tooltipify({ tooltip, user, children }) {
  return tooltip ? (
    <Tooltip
      label={`${user.defaultPersona ? user.defaultPersona.name : user.name}`}
    >
      <div>{children}</div>
    </Tooltip>
  ) : (
    children
  );
}

Tooltipify.propTypes = {
  tooltip: PropTypes.bool,
  user: PropTypes.shape({
    name: PropTypes.string,
    uuid: PropTypes.string,
    defaultPersona: PropTypes.object,
    identity: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  }),
  children: PropTypes.any,
};
