// base imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// material ui imports
import { makeStyles, withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Modal from '@material-ui/core/Modal';
import MuiButton from '@material-ui/core/Button';

// hooks
import { useGetPersonas } from '../hooks/api-hooks.tsx';

// components
import Search from './search';
import NotFound from './not-found';

// icons
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

const Button = withStyles({
  root: {
    textTransform: 'none',
  },
})(MuiButton);

const useStyles = makeStyles(theme => ({
  buttonText: {
    paddingLeft: 6,
  },
  paper: {
    top: `50%`,
    left: `50%`,
    transform: `translate(-50%, -50%)`,
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  spinning: {
    color: '#ff3333',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}));

const AddUsers = ({ community, isModerator, addUser }) => {
  const classes = useStyles();

  /* API calls */
  // fetch users from API
  const { data: users, loading, error } = useGetPersonas({
    resolve: res =>
      res.data.filter(
        value => !community.members.some(member => member.uuid === value.uuid),
      ),
  });

  // getModalStyle is not a pure function, we roll the style only on the first render
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = user => {
    addUser(user, isModerator);
    setOpen(false);
  };

  if (loading) {
    return <CircularProgress className={classes.spinning} />;
  } else if (error) {
    return <NotFound />;
  } else {
    return (
      <div>
        <Button type="button" onClick={handleOpen}>
          <AddCircleOutlineIcon />
          <span className={classes.buttonText}>
            {isModerator ? `Add moderator` : `Add new community members`}
          </span>
        </Button>
        <Modal open={open} onClose={handleClose} aria-label="Add user modal">
          <div className={classes.paper}>
            <Search
              community={community.uuid}
              handleClose={handleClose}
              users={isModerator ? community.members : users}
              isModerator={isModerator}
            />
          </div>
        </Modal>
      </div>
    );
  }
};

AddUsers.propTypes = {
  community: PropTypes.object,
  isModerator: PropTypes.bool,
  addUser: PropTypes.func,
};

export default AddUsers;
