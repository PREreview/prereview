// base imports
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';

// Material UI imports
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import MuiButton from '@material-ui/core/Button';
import Popper from '@material-ui/core/Popper';
import Slide from '@material-ui/core/Slide';
import Typography from '@material-ui/core/Typography';

// utils
import { getYesNoStats } from '../utils/stats';

// components
import Barplot from './barplot';
import ShareMenu from './share-menu';
import TextAnswers from './text-answers';

const Button = withStyles({
  root: {
    textTransform: 'none',
  },
})(MuiButton);

const RapidReviewReader = props => {
  const {
    anchorEl,
    handleAnchor,
    height,
    identifier,
    review,
    role,
    roleIds,
    user,
  } = props;

  const useStyles = makeStyles(() => ({
    popper: {
      backgroundColor: '#fff',
      bottom: '0 !important',
      left: 'unset !important',
      overflowY: 'scroll',
      position: 'fixed !important',
      right: 0,
      top: height ? `${height + 20}px !important` : 0,
      transform: 'none !important',
      width: '40vw',
      zIndex: 10000,
    },
  }));

  const classes = useStyles();
  const history = useHistory();

  const [buttonRefId, setButtonRefId] = useState(null);

  const open = Boolean(anchorEl && review.uuid === buttonRefId);
  const id = open ? review.uuid : undefined;

  useEffect(() => {
    if (anchorEl) {
      setButtonRefId(anchorEl.getAttribute('aria-describedby'));
    } else {
      setButtonRefId(null);
      history.push(`${history.location.pathname.split('/rapid-reviews')[0]}`);
    }
  }, [anchorEl]);

  return (
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
          <Box m={2}>
            <Button
              aria-describedby={id}
              type="button"
              onClick={handleAnchor}
              color="secondary"
            >
              Back
            </Button>
            <Typography>{review.author.name}&apos;s Rapid Review</Typography>
            <Barplot stats={getYesNoStats([review])} nReviews={1}>
              <ShareMenu identifier={identifier} roleIds={roleIds} />
            </Barplot>

            <TextAnswers user={user} role={role} reviews={[review]} />
          </Box>
        </Slide>
      )}
    </Popper>
  );
};

RapidReviewReader.propTypes = {
  anchorEl: PropTypes.object,
  handleAnchor: PropTypes.func.isRequired,
  height: PropTypes.number,
  identifier: PropTypes.string,
  review: PropTypes.object.isRequired,
  role: PropTypes.object,
  roleIds: PropTypes.array,
  user: PropTypes.object,
};

export default RapidReviewReader;
