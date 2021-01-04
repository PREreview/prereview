// base imports
import React from 'react';

// Material UI
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

// icons
import PreReviewLogo from './pre-review-logo';

const useStyles = makeStyles(theme => ({
  root: {
    left: '50%',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
  },
  spinning: {
    color: '#ff3333',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 30,
  },
}));

export default function Loading() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <PreReviewLogo />
      <CircularProgress className={classes.spinning} size={60} />
    </div>
  );
}
