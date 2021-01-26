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
      <XLink to="/" href="/" className="rapid-pre-review-logo__svg-container">
        <img
          src={preReviewLogo}
          className="rapid-pre-review-logo__icon-svg"
          aria-hidden="true"
          alt=""
        />
        <div className="rapid-pre-review-logo__type">
          <div className="rapid-pre-review-logo__outbreak-science">
            <span className="rapid-pre-review-logo__beta">beta</span>
          </div>
        </div>
      </XLink>
    </div>
  );
}

PreReviewLogo.propTypes = {
  short: PropTypes.bool,
  responsive: PropTypes.bool,
};
