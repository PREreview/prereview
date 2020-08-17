import React from 'react';
import PropTypes from 'prop-types';
import './suspense-loading.css';

export default function SuspenseLoading({ children = 'Loading' }) {
  return (
    <div className="suspense-loading">
      <p className="suspense-loading__content">{children}</p>
    </div>
  );
}
SuspenseLoading.propTypes = {
  children: PropTypes.string,
};
