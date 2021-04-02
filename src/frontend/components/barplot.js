// base imports
import React from 'react';
import PropTypes from 'prop-types';

// Material UI imports
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  title: {
    color: theme.palette.secondary.main,
    textTransform: 'uppercase',
  },
  key: {
    paddingLeft: 20,
    paddingRight: 20,
    position: 'relative',
    '&:before': {
      content: '""',
      height: 15,
      left: 0,
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 15,
    },
  },
  keyNA: {
    '&:before': {
      backgroundColor: '#000',
    },
  },
  keyNo: {
    '&:before': {
      backgroundColor: theme.palette.primary.light,
    },
  },
  keyUnsure: {
    '&:before': {
      backgroundColor: theme.palette.secondary.main,
    },
  },
  keyYes: {
    '&:before': {
      backgroundColor: theme.palette.reviews.main,
    },
  },
}));

export default function Barplot({ stats, nReviews, children }) {
  const classes = useStyles();
  return (
    <>
      {stats ? (
        <>
          <Typography
            component="div"
            variant="button"
            className={classes.title}
          >
            Showing {nReviews} Reviews
          </Typography>
          <Typography variant="srOnly">Answer key</Typography>
          <Typography
            component="span"
            variant="button"
            className={`${classes.keyYes} ${classes.key}`}
          >
            Yes
          </Typography>
          <Typography
            component="span"
            variant="button"
            className={`${classes.keyUnsure} ${classes.key}`}
          >
            Unsure
          </Typography>
          <Typography
            component="span"
            variant="button"
            className={`${classes.keyNA} ${classes.key}`}
          >
            N/A
          </Typography>
          <Typography
            component="span"
            variant="button"
            className={`${classes.keyNo} ${classes.key}`}
          >
            No
          </Typography>
        </>
      ) : null}

      <List>
        {stats ? (
          stats.map(({ questionId, nReviews, question, yes, no, na, unsure }) => (
            <ListItem key={questionId}>
            </ListItem>
          ))
        ) : (
          <Typography component="div" variant="body2">
            No rapid reviews. Would you like to leave one?
          </Typography>
        )}
      </List>
    </>
  );
}

Barplot.propTypes = {
  stats: PropTypes.array.isRequired,
  nReviews: PropTypes.number.isRequired,
  children: PropTypes.element, // share menu
};
