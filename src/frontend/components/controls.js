// base imports
import React from 'react';
import PropTypes from 'prop-types';

// Material UI imports
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

export default function Controls({ error, children }) {
  return (
    <Box>
      {error && (
        <Typography component="div">
          Not found. Check for errors and try again.
        </Typography>
      )}

      <Typography component="div">{children}</Typography>
    </Box>
  );
}
Controls.propTypes = {
  children: PropTypes.any,
  error: PropTypes.oneOfType([PropTypes.instanceOf(Error), PropTypes.string]),
};
