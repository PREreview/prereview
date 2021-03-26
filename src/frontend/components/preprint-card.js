// base imports
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { formatDistanceStrict } from 'date-fns';

// utils
import { getTags } from '../utils/stats';
import { getFormattedDatePosted } from '../utils/preprints';
import { createPreprintId, decodePreprintId } from '../../common/utils/ids.js';

// hooks
import { useAnimatedScore } from '../hooks/score-hooks';

// Material UI components
import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

// components
import ReviewReader from './review-reader';

// icons
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

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
  button: {
    color: '#000 !important',
    fontSize: '1.2rem',
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
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
  gridSecondary: {},
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

export default function PreprintCard({
  user,
  preprint,
  onNewRequest,
  onNewReview,
}) {
  const classes = useStyles();
  const history = useHistory();

  const preprintId = createPreprintId(preprint.handle);
  const { id, scheme } = decodePreprintId(preprintId);

  const [elevation, setElevation] = useState(0);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  const { hasData, hasCode, subjects } = getTags(preprint);

  const {
    nRequests,
    nRapidReviews,
    nLongReviews,
    now,
    onStartAnim,
    onStopAnim,
    dateFirstActivity,
    dateLastActivity,
    lastActionType,
    dateLastRapidReview,
    dateLastLongReview,
    dateLastRequest,
    isAnimating,
  } = useAnimatedScore(preprint);

  const publishedReviews = preprint.fullReviews.filter(
    review => review.isPublished,
  );

  const handleHover = () => {
    setElevation(elevation => (elevation ? 0 : 3));
  };

  const handleCardClick = () => {
    console.log('clicked');
    history.push(`/preprints/${preprintId}`);
  };

  useEffect(() => {
    if (user) {
      if (preprint.requests.length) {
        let author;
        preprint.requests.map(request => {
          request.author.uuid
            ? (author = request.author.uuid)
            : (author = request.author);
          setHasRequested(
            user.personas.some(persona => persona.uuid === author),
          );
        });
      }
      if (preprint.fullReviews.length) {
        preprint.fullReviews.map(review => {
          review.authors.map(author => {
            setHasReviewed(
              user.personas.some(persona => persona.uuid === author.uuid),
            );
          });
        });
      } else if (preprint.rapidReviews.length) {
        preprint.rapidReviews.map(review => {
          setHasReviewed(
            user.personas.some(persona => persona.uuid === review.author.uuid),
          );
        });
      }
    }
  }, []);

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
        justifyContent="space-between"
        spacing={0}
        className={classes.gridMain}
      >
        <Grid item xs={12} sm={4}>
          <Typography className={classes.date}>
            {getFormattedDatePosted(preprint.datePosted)}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Typography>
            <Link href={`/preprints/${preprintId}`} className={classes.title}>
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
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Grid
            container
            alignItems="center"
            justifyContent="space-between"
            className={classes.gridSecondary}
          >
            <Grid container item xs={12} sm={10} className={classes.activity}>
              <Grid item className={`${classes.activityItem} ${classes.meta}`}>
                <span className={classes.activityPop}>
                  {preprint.rapidReviews.length}
                </span>{' '}
                rapid reviews
              </Grid>
              <Grid item className={`${classes.activityItem} ${classes.meta}`}>
                <span className={classes.activityPop}>
                  {publishedReviews.length}
                </span>{' '}
                longform reviews
              </Grid>
              <Grid item className={`${classes.activityItem} ${classes.meta}`}>
                <span className={classes.activityPop}>
                  {preprint.requests.length}
                </span>{' '}
                requests
              </Grid>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Typography className={classes.meta}>
                {dateLastActivity
                  ? `Last activity ${formatDistanceStrict(
                      new Date(dateLastActivity),
                      new Date(),
                    )} ago`
                  : `No activity yet`}
              </Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Box width="100%">
            <ReviewReader
              user={user}
              identifier={id}
              preprint={preprint}
              preview={true}
            />
            <Grid container alignItems="center" justify="flex-end" spacing={2}>
              <Grid item>
                {!hasReviewed && (
                  <Button
                    className={classes.button}
                    onClick={() => {
                      onNewReview(preprintId);
                    }}
                  >
                    Add Review
                  </Button>
                )}
              </Grid>
              <Grid item>
                {!hasRequested && (
                  <Button
                    className={classes.button}
                    onClick={() => {
                      onNewRequest(preprintId);
                    }}
                  >
                    Request Review
                  </Button>
                )}
              </Grid>
              <Grid item>
                <Link
                  className={classes.button}
                  href={`/preprints/${preprintId}`}
                >
                  View More
                </Link>
              </Grid>
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}

PreprintCard.propTypes = {
  user: PropTypes.object,
  preprint: PropTypes.shape({
    authors: PropTypes.string,
    handle: PropTypes.string,
    datePosted: PropTypes.string,
    title: PropTypes.string.isRequired,
    preprintServer: PropTypes.string.isRequired,
    fullReviews: PropTypes.array,
    rapidReviews: PropTypes.array,
    requests: PropTypes.array,
  }).isRequired,
  onNewRequest: PropTypes.func.isRequired,
  onNewReview: PropTypes.func.isRequired,
  onNew: PropTypes.func.isRequired,
  isNew: PropTypes.bool,
  hoveredSortOption: PropTypes.oneOf([
    'recentRequests',
    'recentRapid',
    'recentFull',
    'datePosted',
  ]),
};
