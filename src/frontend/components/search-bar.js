import React from 'react';
import PropTypes from 'prop-types';
import MuiSearchBar from 'material-ui-search-bar';
import { useIsMobile } from '../hooks/ui-hooks';

export default function SearchBar({
  isFetching,
  defaultValue,
  onChange,
  onCancelSearch,
  onRequestSearch,
}) {
  const isMobile = useIsMobile();

  return (
    <div className="search-bar">
      <div className="search-bar__left-spacer" />
      <div className="search-bar__search-box">
        <MuiSearchBar
          value={defaultValue}
          onChange={value => onChange(value)}
          onCancelSearch={onCancelSearch}
          onRequestSearch={onRequestSearch}
          className="search-bar__search-box__input"
          placeholder={
            isMobile
              ? 'Search by DOI, arXiv ID or title'
              : 'Search preprints with reviews or requests for reviews by DOI, arXiv ID or title'
          }
          disabled={isFetching}
        />
      </div>
      <div className="search-bar__right-spacer" />
    </div>
  );
}

SearchBar.propTypes = {
  isFetching: PropTypes.bool,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  onRequestSearch: PropTypes.func,
};
