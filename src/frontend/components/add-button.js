// base imports
import React from 'react';

// Material UI imports
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

// icons
import icon from '../assets/images/add_prereview_icon.svg';

const useStyles = makeStyles(theme => ({
  border: {
    borderRight: `2px solid ${theme.palette.primary.contrastText}`,
    paddingRight: 10,
  },
  button: {
    backgroundColor: theme.palette.primary.main,
    borderRadius: 50,
    color: theme.palette.primary.contrastText,
    textTransform: 'none',
    width: 330,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  icon: {
    backgroundColor: theme.palette.primary.contrastText,
    borderRadius: '50%',
    height: 20,
    marginRight: 10,
    padding: 2,
    width: 20,
  },
  text: {
    fontSize: '1.2rem',
    marginRight: 10,
  },
}));

export default function AddButton({ ...buttonProps }) {
  const classes = useStyles();
  return (
    <Button className={classes.button} primary="true" {...buttonProps}>
      <img src={icon} aria-hidden="true" alt="" className={classes.icon} />
      <Typography
        component="span"
        className={`${classes.text} ${classes.border}`}
      >
        Add PREreview
      </Typography>
      <Typography component="span" className={classes.text}>
        Add Request
      </Typography>
    </Button>
  );
}
