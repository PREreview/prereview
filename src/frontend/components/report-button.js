// base imports
import React from 'react';
import PropTypes from 'prop-types';

// hooks
import { usePutFullReview } from '../hooks/api-hooks.tsx';

// Material UI imports
import { withStyles } from '@material-ui/core/styles';
import EmojiFlagsIcon from '@material-ui/icons/EmojiFlags';
import MuiButton from '@material-ui/core/Button';

const Button = withStyles({
  root: {
    textTransform: 'none',
  },
})(MuiButton);

const ReportButton = props => {
  const { reviewId } = props;

  const { mutate: updateReview } = usePutFullReview({
    id: reviewId,
  });

  const handleReport = () => {
    if (confirm('Are you sure you want to report this review?')) {
      updateReview({ isFlagged: true })
        .then(() =>
          alert(
            'This review has been reported to the moderators. They will review it promptly.',
          ),
        )
        .catch(err => alert(`An error occurred: ${err.message}`));
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
  reviewId: PropTypes.string.isRequired,
};

export default ReportButton;
