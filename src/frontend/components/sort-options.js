// base imports
import React from 'react';
import PropTypes from 'prop-types';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import Tooltip from '@reach/tooltip';
import { useIsMobile } from '../hooks/ui-hooks';

// Material UI components
import Grid from '@material-ui/core/Grid';

export default function SortOptions({
  sort,
  order,
  onChange,
  onMouseEnterSortOption,
  onMouseLeaveSortOption,
}) {
  const isMobile = useIsMobile();

  return (
    <Grid container justify="space-between" spacing={2}>
    </Grid>
  );
}

SortOptions.propTypes = {
  onChange: PropTypes.func.isRequired,
  sort: PropTypes.oneOf([
    'recentRequests',
    'recentFull',
    'recentRapid',
    'recentRequests',
    'datePosted',
    '',
  ]),
  order: PropTypes.string,
  onMouseEnterSortOption: PropTypes.func.isRequired,
  onMouseLeaveSortOption: PropTypes.func.isRequired,
};
