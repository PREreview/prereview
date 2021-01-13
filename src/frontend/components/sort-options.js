import React, { useState } from 'react';
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
      {['date'].map(name => (
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
            disabled={name === sort}
            checked={name === sort}
            onClick={e => {
              const sortOption = e.target.value;
              onChange(sort, order === 'asc' ? 'desc' : 'asc');
              if (!isMobile) {
                onMouseLeaveSortOption(sortOption);
              }
            }}
          />
          <Tooltip
            label={`Sort by ${
              name === 'score'
                ? 'trending score (number of reviews and requests divided by time elapsed since first activity)'
                : name === 'new'
                ? 'date of last activity'
                : name === 'reviewed'
                ? 'date of latest review'
                : name === 'requested'
                ? 'date of latest request for reviews'
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
              {name === 'score'
                ? 'Trending'
                : name === 'new'
                ? isMobile
                  ? 'Active'
                  : 'Recently Active'
                : name === 'reviewed'
                ? isMobile
                  ? 'Reviewed'
                  : 'Recently Reviewed'
                : name === 'requested'
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
      ))}
    </div>
  );
}

SortOptions.propTypes = {
  onChange: PropTypes.func.isRequired,
  sort: PropTypes.oneOf(['score', 'reviewed', 'requested', 'new', 'date']),
  order: PropTypes.string,
  onMouseEnterSortOption: PropTypes.func.isRequired,
  onMouseLeaveSortOption: PropTypes.func.isRequired,
};
