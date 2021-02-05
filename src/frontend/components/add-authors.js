// base imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';

// material ui imports
import { makeStyles, withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Modal from '@material-ui/core/Modal';
import MuiButton from '@material-ui/core/Button';

// hooks
import { useGetUsers } from '../hooks/api-hooks.tsx';

// components
import Search from './search';
import Collapse from './collapse';
import Value from './value';

// icons
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

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

const AddAuthors = ({ isMentor, reviewId }) => {
  const classes = useStyles();

  // fetch users from API
  const { data: users, loading: loading, error } = useGetUsers();

  // getModalStyle is not a pure function, we roll the style only on the first render
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [mentorHelpTextOpen, setMentorHelpTextOpen] = useState(false)
  const [coReviewerHelpTextOpen, setCoReviewerHelpTextOpen] = useState(false)

  if (loading) {
    return <CircularProgress className={classes.spinning} />;
  } else {
    return (
      <div>
        <Button type="button" onClick={handleOpen} disabled={!reviewId}>
          <AddCircleOutlineIcon />
          <span className={classes.buttonText}>
            {isMentor ? 'Add mentor' : 'Add co-reviewer(s)'}
          </span>
        </Button>
        <Button
          type='button'
          className={classes.button}
          onClick={e => {
            e.preventDefault();
            isMentor ? setMentorHelpTextOpen(!mentorHelpTextOpen) : setCoReviewerHelpTextOpen(!coReviewerHelpTextOpen)}}
        >
          <HelpOutlineIcon />
        </Button>
        <Collapse isOpened={mentorHelpTextOpen || coReviewerHelpTextOpen}>
          <Value
            tagName="p"
            className="rapid-form-fragment__help-text"
          >
            { isMentor ? `A mentor is a person you wish to invite to give you feedback
            and/or edit your review. They will not be authors of the review, but 
            they will be recognized as having helped you write it. A mentor can be 
            a PREreview user or a prospective PREreview user. In order to 
            invite a mentor, you first need to SAVE the draft of your review.` : `A co-reviewer is a person you wish to invite to write this review with you. They can be a PREreview user or a prospective PREreview user. 
            In order to invite one or more co-reviewer(s), you first need to SAVE the draft of your review.`}
          </Value>
        </Collapse>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
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
