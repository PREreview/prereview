// base imports
import React from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Tooltip from '@reach/tooltip';

// material UI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import MuiAvatar from '@material-ui/core/Avatar';
import Popover from '@material-ui/core/Popover';

// components
//import Avatar from './avatar';
import NoticeBadge from './notice-badge';
import XLink from './xlink';

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
}));

const RoleBadge = React.forwardRef(function RoleBadge(
  { children, className, tooltip, showNotice, user },
  ref,
) {
  return (
    <RoleBadgeUI
      ref={ref}
      tooltip={tooltip}
      user={user}
      className={className}
      showNotice={showNotice}
    >
      {children}
    </RoleBadgeUI>
  );
});

RoleBadge.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  showNotice: PropTypes.bool,
  tooltip: PropTypes.bool,
  user: PropTypes.object.isRequired,
};

export default RoleBadge;

/**
 * Non hooked version (handy for story book and `UserBadge`)
 */
const RoleBadgeUI = React.forwardRef(function RoleBadgeUI(
  { user, className, children, tooltip, showNotice = false },
  ref,
) {
  // ****  USER IN THIS COMPONENT IS ACTUALLY A PERSONA OBJECT **** //

  const classes = useStyles();
  const history = useHistory();
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
          <Tooltipify tooltip={tooltip} user={user}>
            <Avatar src={user.avatar} ref={ref} />
          </Tooltipify>
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
            <XLink
              className="menu__list__link-item"
              onClick={event => {
                event.preventDefault();
                history.push(`/reviews/${user.reviewUuid}`);
              }}
              href={`/reviews/${user.reviewUuid}`}
              target={process.env.IS_EXTENSION ? '_blank' : undefined}
              to={
                process.env.IS_EXTENSION
                  ? undefined
                  : `/reviews/${user.reviewUuid}`
              }
            >
              {user && user.defaultPersona
                ? `View ${user.defaultPersona.name}'s Rapid Review`
                : `View ${user.name}'s Rapid Review`}
            </XLink>
          ) : null}
          <XLink
            className="menu__list__link-item"
            href={`/about/${user.uuid}`}
            target={process.env.IS_EXTENSION ? '_blank' : undefined}
            to={
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
          </XLink>
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
    defaultPersona: PropTypes.object,
    identity: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  }),
  children: PropTypes.any,
};
