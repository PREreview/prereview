// base imports
import React from 'react';
import PropTypes from 'prop-types';

// material ui imports
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import MuiSearchBar from 'material-ui-search-bar';

// material ui icons
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles(theme => ({
  searchbar: {},
  searchbarInner: {
    border: '1px solid #747272',
    borderRadius: 40,
  },
}));

export default function SearchBar({
  isFetching,
  defaultValue,
  placeholderValue,
  onChange,
  onCancelSearch,
  onRequestSearch,
}) {
  const classes = useStyles();
  const placeholder = placeholderValue
    ? placeholderValue
    : 'Enter search terms here';

  return (
    <Box className={classes.searchbar}>
      <Box>
        <MuiSearchBar
          className={classes.searchbarInner}
          value={defaultValue}
          closeIcon={<CloseIcon style={{ color: '#000' }} />}
          onChange={value => onChange(value)}
          onCancelSearch={onCancelSearch}
          onRequestSearch={onRequestSearch}
          placeholder={placeholder}
          disabled={isFetching}
        />
      </Box>
    </Box>
  );
}

SearchBar.propTypes = {
  isFetching: PropTypes.bool,
  defaultValue: PropTypes.string,
  placeholderValue: PropTypes.string,
  onChange: PropTypes.func,
  onRequestSearch: PropTypes.func,
  onCancelSearch: PropTypes.func,
};
