// base imports
import React from 'react';
import PropTypes from 'prop-types';

// Material UI imports
import { makeStyles, withStyles } from '@material-ui/core/styles';
import EmojiFlagsIcon from '@material-ui/icons/EmojiFlags';
import MuiButton from '@material-ui/core/Button';

const Button = withStyles({
  root: {
    textTransform: 'none',
  },
})(MuiButton);

const ReportButton = props => {
  const { reviewId } = props;

  const handleReport = () => {
    if (confirm('Are you sure you want to report this review?')) {
      return; // #FIXME hook up API to report in backend
    }
  };

  return (
    <Button color="primary" onClick={handleReport}>
      <EmojiFlagsIcon />
      Report
    </Button>
  );
};

ReportButton.propTypes = {
  reviewId: PropTypes.number.isRequired,
};

export default ReportButton;
