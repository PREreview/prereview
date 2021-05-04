import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import Tooltip from '@reach/tooltip';
import { useIsMobile } from '../hooks/ui-hooks';

export default function SortOptions({
  sort,
  order,
  onChange,
  onMouseEnterSortOption,
  onMouseLeaveSortOption,
}) {
  const isMobile = useIsMobile();

  return (
    <div className="sort-options">
      {['recentRapid', 'recentFull', 'recentRequests', 'datePosted'].map(
        name => (
          <div
            key={name}
            className={classNames('sort-options__item', {
              'sort-options__item--active': name === sort,
            })}
          >
            <input
              type="radio"
              id={`sort-options-${name}`}
              name={name}
              value={name}
              onClick={e => {
                const sortOption = e.target.value;
                onChange(sortOption, order === 'asc' ? 'desc' : 'asc');
                if (!isMobile) {
                  onMouseLeaveSortOption(sortOption);
                }
              }}
            />
            <Tooltip
              label={`Sort by ${name === 'recentRapid'
                ? 'Date of latest Rapid PREreview'
                : name === 'recentFull'
                  ? 'Date of latest Full PREreview'
                  : name === 'recentRequests'
                    ? 'Date of latest request for review'
                    : 'date posted on preprint server'
                }`}
            >
              <label
                className="sort-options__item-text"
                htmlFor={`sort-options-${name}`}
                onMouseEnter={() => {
                  if (!isMobile) {
                    onMouseEnterSortOption(name);
                  }
                }}
                onMouseLeave={() => {
                  if (!isMobile) {
                    onMouseLeaveSortOption(name);
                  }
                }}
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
              </label>
            </Tooltip>

            {order === 'asc' ? (
              <MdArrowUpward
                className={classNames('sort-options__icon', {
                  'sort-options__icon--selected': name === sort,
                })}
              />
            ) : (
                <MdArrowDownward
                  className={classNames('sort-options__icon', {
                    'sort-options__icon--selected': name === sort,
                  })}
                />
              )}
          </div>
        ),
      )}
    </div>
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
