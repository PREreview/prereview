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

export default function JoinModal() {
  
  
  return (
    <ThemeProvider theme={prereviewTheme}> 
      <DialogTitle id="customized-dialog-title" onClose={handleClose} >
        <PreReviewLogo />
        Join a constructive community of peer reviewers!
      </DialogTitle>
        <Button
          disabled={false}
          element={button}
          onClick={()=>console.log("click this button")}
          primary={true}
          className="login__login-button"
        >
          Sign Up
        </Button>
        <Button
          disabled={false}
          element={button}
          onClick={()=>console.log("click this button")}
          primary={true}
          className="login__login-button"
        >
          Log In
        </Button>               
    </ThemeProvider>
  )
}