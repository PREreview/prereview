// base imports
import React from 'react';
import PropTypes from 'prop-types';

// Material UI imports
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

// icons
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import preReviewLogo from '../svgs/prereview-logo.svg';

const useStyles = makeStyles(theme => ({
  close: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 50,
  },
  dialog: {
    overflowX: 'hidden !important',
  },
  linkContainer: {
    marginTop: 20,
  },
  logo: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 200,
    width: '100%',
  },
  warning: {
    color: theme.palette.secondary.main,
    textTransform: 'uppercase',
  },
}));

export default function LoginRequiredModal({ onClose, open }) {
  const classes = useStyles();
  const url = open ? `/login?next=${encodeURIComponent(open)}` : '/login';

  return (
    <Dialog open={open} onClose={onClose}>
      <Box className={classes.dialog}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          className={classes.close}
        >
          <CloseIcon />
        </IconButton>
        <DialogTitle id="login-modal-title">
          <img
            src={preReviewLogo}
            className={classes.logo}
            alt="You must login to PREreview to continue"
            outline="0"
          />
        </DialogTitle>
        <Box my={2}>
          <Grid container alignItems="center" justify="flex-start">
            <Grid item>
              <ErrorOutlineIcon className={classes.warning} />
            </Grid>
            <Grid item>
              <Typography
                component="div"
                variant="body2"
                className={classes.warning}
              >
                Login Required
              </Typography>
            </Grid>
          </Grid>
          <Typography component="div" variant="body2">
            You must be logged in to perform this action
          </Typography>
          <Typography
            component="div"
            variant="body2"
            className={classes.linkContainer}
          >
            <Link href={url}>Log in or sign up for an account</Link>
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
}

LoginRequiredModal.propTypes = {
  open: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};
