// base imports
import React from 'react';
import PropTypes from 'prop-types';
import { useIsMobile } from '../hooks/ui-hooks';

// Material UI components
import { makeStyles } from '@material-ui/core/styles';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles(() => ({
  sortOptions: {
    alignItems: 'center',
    borderBottom: '1px',
    textTransform: 'uppercase',
  },
}));
export default function SortOptions({
  sort,
  order,
  onChange,
  onMouseEnterSortOption,
  onMouseLeaveSortOption,
}) {
  const classes = useStyles();
  const isMobile = useIsMobile();

  return (
    <Grid container item className={classes.sortOptions} alignItems="center">
      {['recentRapid', 'recentFull', 'recentRequests', 'datePosted'].map(
        name => (
          <Grid container item xs key={name}>
            <Box display="none">
              <Input
                type="radio"
                id={`sort-options-${name}`}
                name={name}
                value={name}
                display="none"
                onClick={e => {
                  const sortOption = e.target.value;
                  onChange(sortOption, order === 'asc' ? 'desc' : 'asc');
                }}
              />
            </Box>
            <Grid item>
              <Tooltip
                title={`Sort by ${
                  name === 'recentRapid'
                    ? 'date of latest rapid review'
                    : name === 'recentFull'
                    ? 'date of latest full review'
                    : name === 'recentRequests'
                    ? 'date of latest request for review'
                    : 'date posted on preprint server'
                }`}
              >
                <InputLabel
                  htmlFor={`sort-options-${name}`}
                  cursor={sort === name ? 'default' : 'pointer'}
                  focus={sort === name}
                >
                  {name === 'recentRapid'
                    ? isMobile
                      ? 'Rapid Reviewed'
                      : 'Recently Rapid Reviewed'
                    : name === 'recentFull'
                    ? isMobile
                      ? 'Reviewed'
                      : 'Recently Reviewed'
                    : name === 'recentRequests'
                    ? isMobile
                      ? 'Requested'
                      : 'Recently Requested'
                    : isMobile
                    ? 'Published'
                    : 'Date Published'}
                </InputLabel>
              </Tooltip>
            </Grid>
            <Grid item>
              {order === 'asc' ? (
                <ArrowUpwardIcon
                  visibility={sort === name ? 'visible' : 'hidden'}
                />
              ) : (
                <ArrowDownwardIcon
                  visibility={sort === name ? 'visible' : 'hidden'}
                />
              )}
            </Grid>
          </Grid>
        ),
      )}
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
  onMouseEnterSortOption: PropTypes.func,
  onMouseLeaveSortOption: PropTypes.func,
};
