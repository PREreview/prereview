// base imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';

// material UI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import MuiAvatar from '@material-ui/core/Avatar';
import Link from '@material-ui/core/Link';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';

// components
import NoticeBadge from './notice-badge';

const Avatar = withStyles({
  root: {
    height: 28,
    width: 28,
  },
})(MuiAvatar);

const useStyles = makeStyles(theme => ({
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
      user={user}
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

/**
 * Non hooked version (handy for story book and `UserBadge`)
 */
export const RoleBadgeUI = React.forwardRef(function RoleBadgeUI(
  {
    user,
    contacts,
    className,
    children,
    tooltip,
    showNotice = false,
    disabled = false,
  },
  ref,
) {
  // ****  USER IN THIS COMPONENT IS ACTUALLY A PERSONA OBJECT **** //

  const classes = useStyles();
  const history = useHistory();

  const [anchorEl, setAnchorEl] = useState(null);
  const [tooltipDisplay, setTooltipDisplay] = useState('none');
  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'user-menu' : undefined;

  const toggleTooltip = () => {
    setTooltipDisplay(tooltipDisplay =>
      tooltipDisplay === 'none' ? 'block' : 'none',
    );
  };

  return (
    <>
      <div className="role-badge-menu-container">
        {showNotice && <NoticeBadge />}
        <button
          type="button"
          aria-describedby={id}
          variant="contained"
          color="primary"
          onClick={handleClick}
          className={classNames('role-badge-menu', className)}
        >
          <span data-expands-text="Close" className="vh">
            Open
          </span>
          <Avatar src={user.avatar} alt={user.name} ref={ref}>
            {user.name.charAt(0)}
          </Avatar>
        </button>
      </div>
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
              <Link
                href={user.reviewUuid}
                onClick={event => {
                  event.preventDefault();
                  history.push(user.reviewUuid);
                }}
              >
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
  children: PropTypes.any,
  className: PropTypes.string,
  showNotice: PropTypes.bool,
  tooltip: PropTypes.bool,
  user: PropTypes.shape({
    defaultPersona: PropTypes.object,
    uuid: PropTypes.string,
    reviewUuid: PropTypes.string,
    identity: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    orcid: PropTypes.string,
    name: PropTypes.string,
    avatar: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  }),
};

export default RoleBadge;
