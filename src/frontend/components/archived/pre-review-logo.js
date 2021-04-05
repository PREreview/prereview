import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import XLink from './xlink';

import preReviewLogo from '../svgs/prereview-logo.svg';

export default function PreReviewLogo({ short = false, responsive = true }) {
  return (
    <div
      className={classNames('rapid-pre-review-logo', {
        'rapid-pre-review-logo--short': short,
        'rapid-pre-review-logo--responsive': responsive,
      })}
    >
      <div className="rapid-pre-review-logo__svg-container">
        <img
          src={preReviewLogo}
          className="rapid-pre-review-logo__icon-svg"
          aria-hidden="true"
          alt=""
          outline="0"
        />
      </div>
    </div>
  );
}

PreReviewLogo.propTypes = {
  short: PropTypes.bool,
  responsive: PropTypes.bool,
};
