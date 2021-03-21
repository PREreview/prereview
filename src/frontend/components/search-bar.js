// base imports
import React from 'react';
import PropTypes from 'prop-types';

// material ui imports
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import MuiSearchBar from 'material-ui-search-bar';

// material ui icons
import SearchIcon from '@material-ui/icons/Search';

const useStyles = makeStyles(theme => ({
  searchbar: {},
  searchbarInner: {
    borderRadius: '50%',
  },
}));

export default function SearchBar({
  isFetching,
  defaultValue,
  onChange,
  onCancelSearch,
  onRequestSearch,
}) {
  const classes = useStyles();

  return (
    <Box className={classes.searchbar}>
      <Box className={classes.searchbarInner}>
        <MuiSearchBar
          value={defaultValue}
          closeIcon={<SearchIcon style={{ color: '#000' }} />}
          onChange={value => onChange(value)}
          onCancelSearch={onCancelSearch}
          onRequestSearch={onRequestSearch}
          className="search-bar__search-box__input"
          placeholder="Enter search terms here"
          disabled={isFetching}
        />
      </Box>
    </Box>
  );
}

SearchBar.propTypes = {
  isFetching: PropTypes.bool,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  onRequestSearch: PropTypes.func,
  onCancelSearch: PropTypes.func,
};
