import React, { Fragment, useContext, useEffect, useState } from 'react';

// material ui
import { ThemeProvider, createMuiTheme, withStyles, makeStyles } from '@material-ui/core/styles';
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
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

// components
import CoCStepper from './coc-stepper'
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

const useStyles = makeStyles((theme) => ({
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
  resetContainer: {
    padding: theme.spacing(3),
  },
}));

const styles = (theme) => ({
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

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

export default function LoginModal({
  open,
  handleClose
}) {
  
  const [modalContent, setModalContent] = useState('coc')

  const openNext = () => {
    setModalContent('continue')
  }

  const handleBack = () => {
    setModalContent('coc')
  }

  const classes = useStyles()
  const next = new URLSearchParams(location.search).get('next');


  return (
  <ThemeProvider theme={prereviewTheme}>
    <Dialog open={open} aria-labelledby="customized-dialog-title" onClose={handleClose}>
      <DialogTitle id="customized-dialog-title" onClose={handleClose}>
        <PreReviewLogo />
      </DialogTitle>
      { modalContent === 'coc' 
        ? <CoCStepper openNext={openNext}/> 
        : <Fragment>
            <DialogContent>
              <Typography variant="h6" gutterBottom>Continue if:</Typography>
               <List>
                 <ListItem>
                   <ListItemIcon>
                     <CheckIcon />
                   </ListItemIcon>
                   <ListItemText primary={`You are okay with us connecting your ORCID public information to your PREreview account and storing it in our database`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                     <CheckIcon />
                   </ListItemIcon>
                   <ListItemText primary={`You are willing to share an email address with our team for the purposes of accessing notifications options and receiving occasional emails on platform updates.`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                     <CheckIcon />
                    </ListItemIcon>
                   <ListItemText primary={`You commit to abiding by our Code of Conduct. `} />
                  </ListItem>
                </List>
            </DialogContent>
            <DialogContent>
              <Typography variant="h6" gutterBottom>Do not continue if:</Typography>
              <List>
                 <ListItem>
                   <ListItemIcon>
                     <ClearIcon />
                   </ListItemIcon>
                   <ListItemText primary={`You DO NOT want to have your ORCID proflie’s public information imported to PREreview.`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                     <ClearIcon />
                   </ListItemIcon>
                   <ListItemText primary={`You are NOT willing to abide by our Code of Conduct.`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                     <ClearIcon />
                    </ListItemIcon>
                   <ListItemText primary={`You DO NOT wish  your reviews and comments to be shared under a CC-BY 4.0 licence.`} />
                  </ListItem>
                </List>
            </DialogContent>
            <DialogContent className={classes.root}>
              <Button
                  onClick={handleBack}
                  className={classes.button}
                >
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
        </Fragment> }

    </Dialog> 
  </ThemeProvider>
  )
}