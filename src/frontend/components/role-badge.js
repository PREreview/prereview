// base imports
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import Tooltip from '@reach/tooltip';

// material UI
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Popover from '@material-ui/core/Popover';

// components
import XLink from './xlink';

const useStyles = makeStyles(theme => ({
  avatar: {
    cursor: 'pointer',
    height: 28,
    width: 28,
  },
  container: {
    border: '2px solid #fff',
    borderRadius: '50%',
    marginRight: '-10px',
    position: 'relative',
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

const RoleBadge = ({ user, children }) => {
  // ****  USER IN THIS COMPONENT IS A PERSONA OBJECT **** //

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
    <div className={classes.container}>
      <Avatar
        className={classes.avatar}
        onClick={handleClick}
        onMouseEnter={toggleTooltip}
        onMouseLeave={toggleTooltip}
        src={user.avatar}
      />
      <div className={classes.tooltip} style={{ display: tooltipDisplay }}>
        {`${user.defaultPersona ? user.defaultPersona.name : user.name}`}
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
                history.push(`/rapid-reviews/${user.reviewUuid}`);
              }}
              href={`/rapid-reviews/${user.reviewUuid}`}
              target={process.env.IS_EXTENSION ? '_blank' : undefined}
              to={
                process.env.IS_EXTENSION
                  ? undefined
                  : `/rapid-reviews/${user.reviewUuid}`
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
    </div>
  );
};

RoleBadge.propTypes = {
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
