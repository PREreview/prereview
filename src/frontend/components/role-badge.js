// base imports
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Tooltip from '@reach/tooltip';

// material UI
import { makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';

// components
import NoticeBadge from './notice-badge';
import XLink from './xlink';

// icons
import { MdPerson } from 'react-icons/md';

const useStyles = makeStyles(theme => ({
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
  console.log('user in RoleBadge', user)
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
  { user, className, children, tooltip, showNotice = false, disabled = false },
  ref,
) {
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
            <div ref={ref}>
              <div
                className={classNames(
                  'role-badge-menu__generic-icon-container',
                )}
              >
                <MdPerson className="role-badge-menu__generic-icon" />
              </div>

              <div
                className={classNames('role-badge-menu__avatar', {
                  'role-badge-menu__avatar--loaded':
                    user && user.avatar && user.avatar.contentUrl,
                })}
                style={
                  user && user.avatar && user.avatar.contentUrl
                    ? {
                        backgroundImage: `url(${user.avatar.contentUrl})`,
                        backgroundSize: 'contain',
                      }
                    : undefined
                }
              />
            </div>
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
          <XLink
            className="menu__list__link-item"
            href={`/about/${
              user.orcid
                ? user.orcid
                : user.identity
                ? user.identity.orcid
                : user.id
            }`}
            target={process.env.IS_EXTENSION ? '_blank' : undefined}
            to={
              process.env.IS_EXTENSION
                ? undefined
                : `/about/${
                    user.orcid
                      ? user.orcid
                      : user.identity
                      ? user.identity.orcid
                      : user.id
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
  showNotice: PropTypes.bool,
  tooltip: PropTypes.bool,
  user: PropTypes.shape({
    defaultPersona: PropTypes.object,
    id: PropTypes.number,
    identity: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    orcid: PropTypes.string,
    name: PropTypes.string,
    avatar: PropTypes.object,
  }),
  children: PropTypes.any,
  className: PropTypes.string,
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
    defaultPersona: PropTypes.object,
    identity: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  }),
  children: PropTypes.any,
};
