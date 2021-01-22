// base imports
import React from 'react';
import PropTypes from 'prop-types';

// Material UI imports
import { makeStyles, withStyles } from '@material-ui/core/styles';
import MuiButton from '@material-ui/core/Button';
import Fade from '@material-ui/core/Fade';
import Popper from '@material-ui/core/Popper';

const useStyles = makeStyles(theme => ({
  paper: {
    border: '1px solid',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
  popper: {
    width: '40vw',
    zIndex: '10000',
  },
}));

const Button = withStyles({
  root: {
    textTransform: 'none',
  },
})(MuiButton);

const LongformReviewReader = props => {
  const { reviewId } = props;
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? reviewId : undefined;

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
          <Fade {...TransitionProps} timeout={350}>
            <div className={classes.paper}>The content of the Popper.</div>
          </Fade>
        )}
      </Popper>
    </div>
  );
};

LongformReviewReader.propTypes = {
  reviewId: PropTypes.number.isRequired,
};

export default LongformReviewReader;
