// base imports
import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from '@reach/tooltip';

// material UI
import { makeStyles, withStyles } from '@material-ui/core/styles';
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
  box: {
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
}));

const RoleBadge = React.forwardRef(function RoleBadge(
  { children, className, tooltip, showNotice, disabled, user },
  ref,
) {
  return (
    <RoleBadgeUI
      ref={ref}
      tooltip={tooltip}
      user={user}
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
  showNotice: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default RoleBadge;

/**
 * Non hooked version (handy for story book and `UserBadge`)
 */
const RoleBadgeUI = React.forwardRef(function RoleBadgeUI(
  { user, children, tooltip, showNotice = false },
  ref,
) {
  // ****  USER IN THIS COMPONENT IS ACTUALLY A PERSONA OBJECT **** //

  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

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
        {showNotice && <ErrorOutlineIcon className={classes.icon} />}
        <IconButton
          aria-describedby={id}
          variant="contained"
          color="primary"
          onClick={handleClick}
        >
          <Typography variant="srOnly">Open</Typography>
          <Tooltipify tooltip={tooltip} user={user}>
            <Avatar src={user.avatar} ref={ref} />
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
          <Link
            target={process.env.IS_EXTENSION ? '_blank' : undefined}
            href={
              process.env.IS_EXTENSION
                ? undefined
                : `/about/${
                    user.defaultPersona ? user.defaultPersona.uuid : user.uuid
                  }`
            }
          >
            {user && user.defaultPersona
              ? `View Profile ${user.defaultPersona.name}`
              : `View Profile ${user.name}`}
          </Link>
          {children}
        </div>
      </Popover>
    </>
  );
});

RoleBadgeUI.propTypes = {
  showNotice: PropTypes.bool,
  tooltip: PropTypes.bool,
  user: PropTypes.shape({
    defaultPersona: PropTypes.object,
    uuid: PropTypes.string,
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
