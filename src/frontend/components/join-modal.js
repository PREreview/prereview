import React, { useEffect, useState } from 'react';

// material ui
import { ThemeProvider, createMuiTheme, withStyles, makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
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

const styles = makeStyles((theme) => ({
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

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
    </MuiDialogTitle>
  );
});

export default function JoinModal({
  open,
  handleClose
}) {

  const classes = styles();
  
  return (
    <ThemeProvider theme={prereviewTheme}> 
      <Dialog open={open}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose} >
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
          disabled={false}
          element={'button'}
          onClick={()=>console.log("click this button")}
          className={classes.button}
        >
          Log In
        </Button>    
      </Dialog>          
    </ThemeProvider>
  )
}