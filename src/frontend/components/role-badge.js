// base imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

// material UI
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Link from '@material-ui/core/Link';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';

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
