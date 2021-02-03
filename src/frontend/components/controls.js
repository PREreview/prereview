import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function Controls({ error, className, children }) {
  return (
    <div className={classNames('controls', className)}>
      {!!error && (
        <div className="controls__error">
          Not found. Check for errors and try again.
        </div>
      )}

      <div className="controls__body">
        <div className="controls__buttons">{children}</div>
      </div>
    </div>
  );
}
Controls.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any,
  error: PropTypes.oneOfType([PropTypes.instanceOf(Error), PropTypes.string]),
};
