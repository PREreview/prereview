// base imports
import React from 'react';
import PropTypes from 'prop-types';

// Material UI imports
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItemMui from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';

const ListItem = withStyles(theme => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(ListItemMui);

const useStyles = makeStyles(theme => ({
  title: {
    color: theme.palette.secondary.main,
    textTransform: 'uppercase',
  },
  key: {
    color: theme.palette.secondary.main,
    paddingLeft: 20,
    paddingRight: 20,
    position: 'relative',
    textTransform: 'uppercase',
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
  response: {
    height: 22,
  },
  responseText: {
    color: theme.palette.primary.contrastText,
    paddingBottom: 4,
    paddingLeft: 4,
  },
  responseNa: {
    backgroundColor: '#000',
  },
  responseNo: {
    backgroundColor: theme.palette.primary.light,
  },
  responseUnsure: {
    backgroundColor: theme.palette.secondary.main,
  },
  responseYes: {
    backgroundColor: theme.palette.reviews.main,
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
            Showing {nReviews} PREreviews
          </Typography>
          <Grid container spacing={2} justify="space-between">
            <Grid item>
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
            </Grid>
            <Grid item>{children}</Grid>
          </Grid>
        </>
      ) : null}

      <List>
        {stats ? (
          stats.map(({ questionId, nReviews, question, yes, no, na, unsure }) => (
              <ListItem key={questionId}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography component="div" variant="body1">
                      {question}
                    </Typography>
                  </Grid>
                  <Grid container item spacing={0} xs={12} sm={6}>
                    <Grid
                      item
                      className={`${classes.response} ${classes.responseYes}`}
                      style={{ width: `${(yes.length / nReviews) * 100}%` }}
                    >
                      <Typography className={classes.responseText}>
                        {`${(yes.length / nReviews) * 100}%`}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      className={`${classes.response} ${
                        classes.responseUnsure
                      }`}
                      style={{ width: `${(unsure.length / nReviews) * 100}%` }}
                    >
                      <Typography className={classes.responseText}>
                        {`${(unsure.length / nReviews) * 100}%`}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      className={`${classes.response} ${classes.responseNa}`}
                      style={{ width: `${(na.length / nReviews) * 100}%` }}
                    >
                      <Typography className={classes.responseText}>
                        {`${(na.length / nReviews) * 100}%`}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      className={`${classes.response} ${classes.responseNo}`}
                      style={{ width: `${(no.length / nReviews) * 100}%` }}
                    >
                      <Typography className={classes.responseText}>
                        {`${(no.length / nReviews) * 100}%`}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </ListItem>
            ),
          )
        ) : (
          <Typography component="div" variant="body2">
            No rapid PREreviews. Would you like to leave one?
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
