// base imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// Material UI Componets
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';

// components
import ActivityCard from './activity-card';

const useStyles = makeStyles(theme => ({
  box: {
    color: theme.palette.secondary.main,
    textTransform: 'uppercase',
  },
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

export default function RoleActivity({ persona }) {
  const classes = useStyles();

  const [activity, setActivity] = useState(null);

  useEffect(() => {
    const fullReviews = persona.fullReviews
      ? persona.fullReviews.filter(item => item.isPublished)
      : null;

    setActivity(() => [fullReviews, persona.rapidReviews].flat());
  }, []);

  return (
    <>
      {activity && activity.length ? (
        <Box className={classes.box}>
          <Typography>
            Total number of requests: {persona.requests.length || 0}
          </Typography>
          <Typography>
            Total number of rapid reviews: {persona.rapidReviews.length || 0}
          </Typography>
          <Typography>
            Total number of long-form reviews:{' '}
            {persona.fullReviews.filter(review => review.isPublished).length ||
              0}
          </Typography>
        </Box>
      ) : null}
      {!activity || !activity.length ? (
        <Typography>No activity yet.</Typography>
      ) : (
        <Box mt={4}>
          <Typography component="h3" variant="h3">
            History
          </Typography>
          <List>
            {activity.length &&
              activity.map(activity => (
                <ListItem key={activity.handle} className={classes.listItem}>
                  <ActivityCard key={activity.uuid} activity={activity} />
                </ListItem>
              ))}
          </List>
        </Box>
      )}
    </>
  );
}

RoleActivity.propTypes = {
  persona: PropTypes.object.isRequired,
};
