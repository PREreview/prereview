// base imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';

// material ui imports
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Modal from '@material-ui/core/Modal';
import MuiButton from '@material-ui/core/Button';
import MuiTooltip from '@material-ui/core/Tooltip';


// hooks
import { useGetPersonas } from '../hooks/api-hooks.tsx';

// components
import Search from './search';
import NotFound from './not-found';


// icons
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

const Button = withStyles({
  root: {
    textTransform: 'none',
  },
})(MuiButton);

const Tooltip = withStyles(theme => ({
  tooltip: {
    fontSize: theme.typography.pxToRem(16),
    padding: 10,
  },
}))(MuiTooltip);

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

const AddAuthors = ({ isMentor, reviewId, members, membersLimit = 5 }) => {
  const classes = useStyles();

  // fetch users from API
  const { data: users, loading: loading, error: personasError } = useGetPersonas();

  // getModalStyle is not a pure function, we roll the style only on the first render
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (loading) {
    return <CircularProgress className={classes.spinning} />;
  } else if (personasError) {
    return <NotFound />
  } else {
    return (
      <div>
        <Button type="button" onClick={handleOpen} disabled={!reviewId}>
          <AddCircleOutlineIcon />
          <span className={classes.buttonText}>
            {isMentor ? 'Add mentor' : 'Add co-reviewer(s)'}
          </span>
        </Button>
        <Tooltip
          title={
            isMentor
              ? `A mentor is a person you wish to invite to give you feedback and/or edit your review. They will not be authors of the review, but they will be recognized as having helped you write it. A mentor can be a PREreview user or a prospective PREreview user. In order to invite a mentor, you first need to SAVE the draft of your review.`
              : `A co-reviewer is a person you wish to invite to write this review with you. They can be a PREreview user or a prospective PREreview user. In order to invite one or more co-reviewer(s), you first need to SAVE the draft of your review.`
          }
        >
          <IconButton type="button" className={classes.button}>
            <HelpOutlineIcon color="action" fontSize="small" />
          </IconButton>
        </Tooltip>
        {!!members && (
          <AvatarGroup max={membersLimit}>
            {members.map(member => (
              <Avatar key={member.uuid} alt={member.name} src={member.avatar} />
            ))}
          </AvatarGroup>
        )}
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="add-authors-modal"
          aria-describedby="add-authors-modal"
        >
          <div className={classes.paper}>
            <Search
              handleClose={handleClose}
              isMentor={isMentor}
              reviewId={reviewId}
              users={users.data}
            />
          </div>
        </Modal>
      </div>
    );
  }
};

AddAuthors.propTypes = {
  isMentor: PropTypes.bool,
  reviewId: PropTypes.string,
};

export default AddAuthors;
