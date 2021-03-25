// base imports
import React from 'react';
import PropTypes from 'prop-types';

// material ui
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';

// icons
import CloseIcon from '@material-ui/icons/Close';
import preReviewLogo from '../svgs/prereview-logo.svg';

const styles = makeStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  button: {
    color: '#000 !important',
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  close: {
    marginLeft: 'auto',
    marginRight: 0,
    width: 50,
  },
  dialogTitle: {
    textAlign: 'center',
  },
  logo: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 200,
    width: '100%',
  },
}));

function JoinModal({ open, handleClose }) {
  const classes = styles();

  const next = new URLSearchParams(location.search).get('next');

  return (
    <Dialog open={open}>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        className={classes.close}
      >
        <CloseIcon />
      </IconButton>
      <img
        src={preReviewLogo}
        className={classes.logo}
        aria-hidden="true"
        alt=""
        outline="0"
      />
      <DialogTitle
        id="login-modal-title"
        onClose={handleClose}
        className={classes.dialogTitle}
      >
        Join a constructive community of peer reviewers!
      </DialogTitle>
      <Button
        disabled={false}
        onClick={() => handleClose('next')}
        className={classes.button}
      >
        Sign up for an account
      </Button>

      <Button
        href={`/api/v2/orcid/login${
          next ? `?next=${encodeURIComponent(next)}` : ''
        }`}
        className={classes.button}
      >
        Log In
      </Button>
    </Dialog>
  );
}

JoinModal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func.isRequired,
};

export default JoinModal;
