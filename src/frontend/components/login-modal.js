// base imports
import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';

// material ui
import {
  ThemeProvider,
  createMuiTheme,
  withStyles,
  makeStyles,
} from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import Dialog from '@material-ui/core/Dialog';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

// components
import CoCStepper from './coc-stepper';
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

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  dialog: {
    overflowX: 'hidden !important',
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
}));

const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
    align: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)(props => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

function LoginModal({ open, handleClose }) {
  const [modalContent, setModalContent] = useState('coc');

  const openNext = () => {
    setModalContent('continue');
  };

  const handleCancel = () => {
    setModalContent('cancel');
  };

  const classes = useStyles();
  const next = new URLSearchParams(location.search).get('next');

  const getModalContent = content => {
    switch (content) {
      case 'coc':
        return <CoCStepper openNext={openNext} />;
      case 'continue':
        return (
          <Fragment>
            <DialogContent>
              <Typography variant="h6" gutterBottom>
                Continue if:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`You are okay with us connecting your public ORCID record to your PREreview account and storing it in our database.`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`You are willing to share an email address with our team for the purposes of accessing notifications options and receiving occasional emails on platform updates.`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon />
                  </ListItemIcon>
                  <ListItemText>
                    You commit to abiding by our{' '}
                    <a
                      href="https://content.prereview.org/coc"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Code of Conduct
                    </a>
                    .
                  </ListItemText>
                </ListItem>
              </List>
            </DialogContent>
            <DialogContent>
              <Typography variant="h6" gutterBottom>
                Do not continue if:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <ClearIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`You DO NOT want to have your public ORCID record imported to PREreview.`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ClearIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`You are NOT willing to abide by our Code of Conduct.`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ClearIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`You DO NOT wish  your reviews and comments to be shared under a CC-BY 4.0 license.`}
                  />
                </ListItem>
              </List>
            </DialogContent>
            <DialogContent className={classes.root}>
              <Button onClick={handleCancel} className={classes.button}>
                Cancel
              </Button>
              <Button
                href={`/api/v2/orcid/login${
                  next ? `?next=${encodeURIComponent(next)}` : ''
                }`}
                className={classes.button}
              >
                Continue to ORCID sign-in
              </Button>
            </DialogContent>
          </Fragment>
        );
      case 'cancel':
        return (
          <Fragment>
            <DialogContent>
              <List>
                <ListItemText>
                  We are sorry you cannot join our community at this moment.
                  We hope you come back soon!
                </ListItemText>

                <ListItemText>
                  If you have any questions or concerns, please do not
                  hesitate to contact us at{' '}
                  <a href="mailto:contact:prereview.org">
                    contact@prereview.org
                  </a>. {' '}
                  You can also give us anonymous feedback via{' '}
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdjlXuPgmA0p3xcQ316_qJAXvisEN_jywzAJ5jQREmj1c-uCA/viewform"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    this feedback form
                  </a>
                  .
                </ListItemText>
                <ListItemText>Thank you!</ListItemText>
              </List>
            </DialogContent>
          </Fragment>
        );
    }
  };

  return (
    <ThemeProvider theme={prereviewTheme}>
      <Dialog
        open={open}
        aria-labelledby="login-modal-title"
        disableBackdropClick={true}
        onClose={handleClose}
      >
        <Box className={classes.dialog} p={4}>
          <DialogTitle id="login-modal-title" onClose={handleClose}>
            <PreReviewLogo />
          </DialogTitle>
          {getModalContent(modalContent)}
        </Box>
      </Dialog>
    </ThemeProvider>
  );
}

LoginModal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func.isRequired,
};

export default LoginModal;
