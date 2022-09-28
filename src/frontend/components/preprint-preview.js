// base imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

// utils
import { getFormattedDatePosted } from '../utils/preprints';
import { createPreprintId } from '../../common/utils/ids';

// Material UI components
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';

// components

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
    backgroundColor: theme.palette.secondary.light,
    // marginBottom: 10,
    // marginTop: 10,
    width: '100%',
  },
  popover: {
    marginTop: theme.spacing(2),
    pointerEvents: 'none',
    zIndex: '20000 !important',
  },
  popoverInner: {
    maxWidth: '40rem',
    padding: theme.spacing(2),
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
    whiteSpace: 'pre-wrap',
  },
}));

function NewPrereviewButton({ preprintId }) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
        <Button
          color='primary'
          variant='contained'
          href={`https://beta.prereview.org/preprints/${preprintId}`}
          aria-owns={open ? 'mouse-over-popover' : undefined}
          aria-haspopup="true"
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
        >
          Try the new PREreview
        </Button>
      <Popover
        id="mouse-over-popover"
        className={classes.popover}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <div className={classes.popoverInner}>
          <Typography>
            We‘re working on a new version of PREreview, where you can read and
            write full PREreviews for this preprint. Try it out, and let us know
            what you think.
          </Typography>
        </div>
      </Popover>
    </>
  );
}

export default function PreprintPreview({ preprint }) {
  const classes = useStyles();
  const history = useHistory();

  const [elevation, setElevation] = useState(0);
  const preprintId = createPreprintId(preprint.handle);
  const publishedReviews = preprint.fullReviews.filter(
    review => review.isPublished,
  );

  const handleHover = () => {
    setElevation(elevation => (elevation ? 0 : 3));
  };

  const handleCardClick = () => {
    history.push(`/preprints/${preprintId}`);
  };

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
        <Grid item xs={12} sm={4}>
          <Typography className={classes.date}>
            {getFormattedDatePosted(preprint.datePosted)}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Typography>
            <Link href={preprint.url} className={classes.title}>
              {preprint.title}
            </Link>
          </Typography>
          <Typography>
            <span className={classes.preprintServer}>
              {preprint.preprintServer}
              <ChevronRightIcon className={classes.icon} />
            </span>
            <Link href={preprint.url} className={classes.meta}>
              {preprint.handle}
            </Link>
          </Typography>
        </Grid>
      </Grid>
      {(preprint.handle.startsWith('doi:10.1101/') || (preprint.handle.startsWith('doi:10.1590/') && preprint.publication === 'FapUNIFESP (SciELO)') || preprint.handle.startsWith('doi:10.31730/')) &&
        <Box
          position={{lg: 'absolute'}}
          right={{lg: 0}}
          mt={{lg: -7, xl: -5}}
          mr={{lg: 8}}
          mb={{xs: 1, lg: 0}}
          ml={{xs: 2, lg: 0}}
        >
          <NewPrereviewButton preprintId={preprintId} />
        </Box>
      }
      <Box
        alignItems="center"
        justifycontent="space-between"
        className={classes.gridSecondary}
      >
        <Grid container className={classes.activity}>
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
PreprintPreview.propTypes = {
  preprint: PropTypes.object.isRequired,
};
