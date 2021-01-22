// base imports
import React from 'react';
import PropTypes from 'prop-types';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';

// Material UI imports
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import MuiButton from '@material-ui/core/Button';
import Popper from '@material-ui/core/Popper';
import Slide from '@material-ui/core/Slide';

// components
import ReportButton from './report-button';
import RoleBadge from './role-badge';

const Button = withStyles({
  root: {
    textTransform: 'none',
  },
})(MuiButton);

const LongformReviewReader = props => {
  const { review, height } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);

  const useStyles = makeStyles(() => ({
    authors: {
      fontSize: '1.25rem',
      fontWeight: '600',
      justifyContent: 'flex-start',
      lineHeight: 1.3,
    },
    author: {
      '&:not(:last-child)': {
        '&:after': {
          content: '", "',
        },
      },
    },
    badge: {
      '&:not(:first-child)': {
        marginLeft: '-10px',
      },
    },
    date: {
      fontSize: '1rem',
    },
    popper: {
      backgroundColor: '#fff',
      height: '100%',
      left: 'unset !important',
      position: 'fixed !important',
      right: 0,
      top: height ? `${height}px !important` : 0,
      transform: 'none !important',
      width: '40vw',
      zIndex: '10000',
    },
    popperContent: {
      padding: 20,
    },
  }));

  const classes = useStyles();

  const handleClick = event => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? review.id : undefined;
  const reviewDate = new Date(review.updatedAt);
  const reviewContent = review.drafts[review.drafts.length - 1];

  const transform = node => {
    if (node.attribs) {
      if (node.attribs.class === 'ql-editor') {
        node.attribs.class = '';
        node.attribs.contenteditable = false;
      } else if (
        node.attribs.class === 'ql-clipboard' ||
        node.attribs.class === 'ql-tooltip ql-hidden'
      ) {
        return null;
      }
    }
    return convertNodeToElement(node);
  };

  const options = {
    decodeEntities: true,
    transform,
  };

  return (
    <div>
      <Button
        aria-describedby={id}
        type="button"
        onClick={handleClick}
        color="secondary"
      >
        Comment
      </Button>
      <Popper
        id={id}
        open={open}
        anchorEl={anchorEl}
        transition
        className={classes.popper}
      >
        {({ TransitionProps }) => (
          <Slide
            direction="left"
            mountOnEnter
            unmountOnExit
            timeout={350}
            {...TransitionProps}
          >
            <div className="review-reader-longform">
              <Button
                aria-describedby={id}
                type="button"
                onClick={handleClick}
                color="secondary"
              >
                Back
              </Button>
              <div className={classes.popperContent}>
                <Grid container justify="space-between" alignItems="center">
                  {review.authors.length > 1 ? (
                    <Grid
                      container
                      item
                      justify="flex-start"
                      alignItems="center"
                      spacing={2}
                      xs={12}
                      sm={9}
                    >
                      <Grid container item xs={12} sm={4}>
                        {review.authors.map(author => (
                          <div key={author.id} className={classes.badge}>
                            <RoleBadge user={author} />
                          </div>
                        ))}
                      </Grid>
                      <Grid item xs={12} sm={8} className={classes.authors}>
                        Review by{' '}
                        {review.authors.map(author => (
                          <span key={author.id} className={classes.author}>
                            {author.name}
                          </span>
                        ))}
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid
                      container
                      item
                      justify="flex-start"
                      alignItems="center"
                      spacing={2}
                      xs={12}
                      sm={9}
                    >
                      <Grid item>
                        <RoleBadge user={review.authors[0]} />
                      </Grid>
                      <Grid className={classes.authors}>{`${
                        review.authors[0].name
                      }'s review`}</Grid>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={3} className={classes.date}>
                    {reviewDate.toLocaleDateString('en-US')}
                  </Grid>
                </Grid>
                <Box border="1px solid #E5E5E5" mt={4} px={3} pb={2}>
                  <Box>{ReactHtmlParser(reviewContent.contents, options)}</Box>
                  <Grid
                    container
                    alignItems="center"
                    justify="space-between"
                    spacing={2}
                  >
                    <Grid item>Plaudit FIXME</Grid>
                    <Grid item>
                      <ReportButton />
                    </Grid>
                  </Grid>
                </Box>
              </div>
            </div>
          </Slide>
        )}
      </Popper>
    </div>
  );
};

LongformReviewReader.propTypes = {
  review: PropTypes.object.isRequired,
  height: PropTypes.number,
};

export default LongformReviewReader;
