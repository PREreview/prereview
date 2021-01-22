// base imports
import React from 'react';
import PropTypes from 'prop-types';

// Material UI imports
import { makeStyles, withStyles } from '@material-ui/core/styles';
import MuiButton from '@material-ui/core/Button';
import Popper from '@material-ui/core/Popper';
import Slide from '@material-ui/core/Slide';

const useStyles = makeStyles(() => ({
  author: {
    '&:not(:last-child)': {
      '&:after': {
        content: ',',
      },
    },
  },
  popper: {
    backgroundColor: '#fff',
    height: '100%',
    left: 'unset !important',
    right: 0,
    transform: 'none !important',
    width: '40vw',
    zIndex: '10000',
  },
  popperContent: {
    padding: 20,
  },
}));

const Button = withStyles({
  root: {
    textTransform: 'none',
  },
})(MuiButton);

const LongformReviewReader = props => {
  const { review } = props;
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? review.id : undefined;

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
            <div>
              <Button
                aria-describedby={id}
                type="button"
                onClick={handleClick}
                color="secondary"
              >
                Back
              </Button>
              <div className={classes.popperContent}>
                <div>
                  {review.authors.length > 1 ? (
                    <span className={classes.author}>
                      Review by
                      {review.authors.map(author => (
                        <span key={author.id}>{author.name}</span>
                      ))}
                    </span>
                  ) : (
                    <span>{`${review.authors[0].name}'s review`}</span>
                  )}
                </div>
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
};

export default LongformReviewReader;
