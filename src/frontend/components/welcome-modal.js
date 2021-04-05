// base imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';

// material ui imports
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import MuiButton from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

// icons
import preReviewLogo from '../svgs/prereview-logo.svg';

const Button = withStyles({
  root: {
    textTransform: 'none',
  },
})(MuiButton);

const useStyles = makeStyles(theme => ({
  root: {
    overflow: 'scroll',
  },
  img: {
    display: 'block',
    maxWidth: 150,
    width: '100%',
  },
  logo: {
    marginBottom: '2rem',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 150,
  },
  modal: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    minWidth: 300,
    padding: theme.spacing(4),
    position: 'relative',
    zIndex: 100,
    [theme.breakpoints.up('md')]: {
      left: '50%',
      position: 'absolute',
      top: '50%',
      transform: 'translate(-50%, -50%)',
    },
  },
}));

export default function WelcomeModal(props) {
  const classes = useStyles();

  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-label="welcome"
      className={classes.root}
      {...props}
    >
      <div className={classes.modal}>
        <header className={classes.logo}>
          <img src={preReviewLogo} className={classes.img} />
        </header>
        <div className="welcome-modal__body" align="center">
          <Typography variant="h5" paragraph gutterBottom>
            Welcome to the new PREreview.org, a site for crowdsourcing preprint
            reviews.
          </Typography>
          <Typography variant="body1" component="div" paragraph gutterBottom>
            This is the marriage between two preprint review platforms:{' '}
            <em>PREreview.org</em> and <em>outbreaksci.prereview.org</em>. If
            you were a user of either of these platforms, your information has
            been migrated to this new site. If you are a new user, welcome to
            the family!
          </Typography>
          <Typography variant="body1" component="div" paragraph gutterBottom>
            On this platform, you can:
            <ol>
              <li>Read rapid and long-form reviews of existing preprints.</li>
              <li>
                Request reviews of preprints (your own, or preprints in which
                you are interested in seeing community feedback).
              </li>
              <li>
                Review preprints (as an individual, with a mentor, or in
                collaboration with co-reviewers).
              </li>
              <li>
                Find and join communities that are reviewing and discussing
                research relevant to you or start your own community.
              </li>
            </ol>
          </Typography>
          <div className="welcome-modal__controls">
            <Button
              type="button"
              onClick={handleClose}
              color="primary"
              variant="contained"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

WelcomeModal.propTypes = {
  onClose: PropTypes.func,
};
