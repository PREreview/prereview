// base imports
import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { formatDistanceStrict } from 'date-fns';

// utils
import { getTags } from '../utils/stats';
import { getFormattedDatePosted } from '../utils/preprints';
import {
  createPreprintId,
  decodePreprintId,
  getCanonicalArxivUrl,
  getCanonicalDoiUrl,
} from '../../common/utils/ids.js';

// hooks
import { useAnimatedScore } from '../hooks/score-hooks';

// Material UI components
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

// components


// icons
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import addPrereviewIcon from '../svgs/add_prereview_icon.svg';

const useStyles = makeStyles(theme => ({
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
  grid: {
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
    borderBottom: `1px solid ${theme.palette.secondary.main}`,
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
  onNew,
  hoveredSortOption,
  isNew = false,
}) {
  const classes = useStyles();

  const [isOpened, setIsOpened] = useState(false);

  const { title, preprintServer, handle, datePosted } = preprint;

  const preprintId = createPreprintId(handle);
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
    setElevation(elevation => elevation ? 0 : 3);
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
        container
        direction="row-reverse"
        justifyContent="space-between"
        spacing={2}
        className={classes.grid}
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
