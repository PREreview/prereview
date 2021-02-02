// base imports
import React from 'react';
import PropTypes from 'prop-types';

// material ui
import {
  ThemeProvider,
  createMuiTheme,
  withStyles,
  makeStyles,
} from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

// components
import PreReviewLogo from './pre-review-logo';

const prereviewTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#F77463',
      contrastText: '#fff',
    },
    secondary: {
      main: '#eaeaf0',
    },
  },
  typography: {
    fontFamily: ['Open Sans', 'sans-serif'].join(','),
  },
});

const styles = makeStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

const DialogTitle = withStyles(styles)(props => {
  const { children, classes, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
    </MuiDialogTitle>
  );
});

function JoinModal({ open, handleClose }) {
  const classes = styles();

  const next = new URLSearchParams(location.search).get('next');

  return (
    <ThemeProvider theme={prereviewTheme}>
      <Dialog open={open}>
        <DialogTitle id="login-modal-title" onClose={handleClose}>
          <PreReviewLogo />
          Join a constructive community of peer reviewers!
        </DialogTitle>
        <Button
          disabled={false}
          onClick={handleClose}
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
    </ThemeProvider>
  );
}

JoinModal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func.isRequired,
};

export default JoinModal;
