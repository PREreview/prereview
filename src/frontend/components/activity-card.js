// base imports
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';

// utils
import { getFormattedDatePosted } from '../utils/preprints';
import { createPreprintId } from '../../common/utils/ids';

// hooks
import { useGetPreprint } from '../hooks/api-hooks.tsx';

// Material UI components
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

// components
import Loading from './loading';
import NotFound from './not-found';

// icons
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

const useStyles = makeStyles(theme => ({
  activity: {
    padding: 10,
  },
  activityItem: {
    '&:not(:last-child)': {
      borderRight: `2px solid ${theme.palette.secondary.light}`,
      marginRight: 10,
      paddingRight: 10,
    },
  },
  activityPop: {
    color: theme.palette.primary.main,
    fontSize: '0.9rem',
    fontWeight: 700,
  },
  authors: {
    fontSize: '0.9rem',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  date: {
    color: theme.palette.secondary.main,
    fontSize: '1.2rem',
    textAlign: 'right',
  },
  gridMain: {
    borderBottom: `1px solid ${theme.palette.secondary.light}`,
    cursor: 'pointer',
    padding: 20,
  },
  icon: {
    color: theme.palette.secondary.main,
    height: 30,
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 30,
  },
  meta: {
    color: theme.palette.secondary.main,
    fontSize: '0.9rem',
  },
  paper: {
    borderBottom: `2px solid ${theme.palette.secondary.light}`,
    marginBottom: 10,
    width: '100%',
  },
  preprintServer: {
    color: theme.palette.primary.main,
    fontSize: '0.9rem',
    fontWeight: 700,
    paddingRight: 40,
    position: 'relative',
  },
  title: {
    color: '#000 !important',
    display: 'block',
    fontSize: '1.3rem',
    fontWeight: 700,
    marginBottom: 10,
  },
}));

export default function ActivityCard({ activity }) {
  const classes = useStyles();
  const history = useHistory();

  const [elevation, setElevation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [preprint, setPreprint] = useState(null);
  const [publishedReviews, setPublishedReviews] = useState(null);

  const {
    data: preprintData,
    loading: loadingPreprint,
    error,
  } = useGetPreprint({
    id: createPreprintId(activity.preprint.handle),
  });

  const handleHover = () => {
    setElevation(elevation => (elevation ? 0 : 3));
  };

  const handleCardClick = () => {
    window.location.href = `https://beta.prereview.org/preprints/${createPreprintId(activity.preprint.handle)}`
  };

  const getActivityText = activity => {
    if (activity.isLongReview) {
      return 'published a full PREreview on ';
    } else if (activity.ynAvailableCode) {
      return 'rapid PREreviewed on ';
    } else {
      return 'requested PREreviews for this preprint on ';
    }
  };

  useEffect(() => {
    if (!loadingPreprint) {
      if (preprintData) {
        if (preprintData.data[0].fullReviews) {
          let newPublishedReviews = preprintData.data[0].fullReviews.filter(
            review => review.isPublished,
          );
          setPublishedReviews(newPublishedReviews);
        }
        setPreprint(preprintData.data[0]);
        setLoading(false);
      }
    }
  }, [loadingPreprint, preprintData]);

  if (error) {
    return <NotFound />;
  } else if (loading) {
    return <Loading />;
  } else {
    return (
      <Paper
        elevation={elevation}
        square
        className={classes.paper}
        onMouseEnter={handleHover}
        onMouseLeave={handleHover}
      >
        <Grid
          onClick={handleCardClick}
          container
          direction="row-reverse"
          justifycontent="space-between"
          spacing={0}
          className={classes.gridMain}
        >
          <Grid item xs={12} sm={5}>
            <Typography className={classes.date}>
              {getActivityText(activity)}
              {getFormattedDatePosted(activity.preprint.datePosted)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={7}>
            <Typography>
              <Link
                href={`/preprints/${createPreprintId(
                  activity.preprint.handle,
                )}`}
                className={classes.title}
              >
                {preprint.title}
              </Link>
            </Typography>
            <Typography className={classes.authors}>
              {preprint.authors}
            </Typography>
            <Typography>
              <span className={classes.preprintServer}>
                {preprint.preprintServer}
                <ChevronRightIcon className={classes.icon} />
              </span>
              <span className={classes.meta}>{preprint.handle}</span>
            </Typography>
          </Grid>
        </Grid>
        <Box
          container
          alignItems="center"
          justifycontent="space-between"
          className={classes.gridSecondary}
        >
          <Grid container xs={12} sm={10} className={classes.activity}>
            <Grid item className={`${classes.activityItem} ${classes.meta}`}>
              <Typography component="div" variant="body1">
                <span className={classes.activityPop}>
                  {preprint.rapidReviews.length}
                </span>{' '}
                rapid PREreviews
              </Typography>
            </Grid>
            <Grid item className={`${classes.activityItem} ${classes.meta}`}>
              <Typography component="div" variant="body1">
                <span className={classes.activityPop}>
                  {publishedReviews && publishedReviews.length
                    ? publishedReviews.length
                    : 0}
                </span>{' '}
                full PREreviews
              </Typography>
            </Grid>
            <Grid item className={`${classes.activityItem} ${classes.meta}`}>
              <Typography component="div" variant="body1">
                <span className={classes.activityPop}>
                  {preprint.requests.length}
                </span>{' '}
                requests
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    );
  }
}

ActivityCard.propTypes = {
  activity: PropTypes.object.isRequired,
};
