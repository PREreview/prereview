import React, { useEffect, useState } from 'react';

// material ui
import { ThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import CoCStepper from './coc-stepper'

// components
import PreReviewLogo from './pre-review-logo';
import Button from './button'

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

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
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

export default function JoinModal({
  open,
  handleClose
}) {
  return (
    <ThemeProvider theme={prereviewTheme}> 
      <Dialog open={open}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose} >
          <PreReviewLogo />
          Join a constructive community of peer reviewers!
        </DialogTitle>
        <Button
          disabled={false}
          element={'button'}
          onClick={()=>console.log("click this button")}
          primary={true}
          className="login__login-button"
        >
          Sign Up
        </Button>
        <Button
          disabled={false}
          element={'button'}
          onClick={()=>console.log("click this button")}
          primary={true}
          className="login__login-button"
        >
          Log In
        </Button>    
      </Dialog>          
    </ThemeProvider>
  )
}