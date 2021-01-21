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

function formatError(err) {
  if (!err) return '';

  const message = err.message || err.description;
  const name = err.name;
  const statusCode = err.statusCode;

  if (message) {
    if (name && statusCode) {
      return `${name}: ${message} (${statusCode.toString()})`;
    } else if (name) {
      return `${name}: ${message}`;
    } else if (statusCode) {
      return `${message} (${statusCode.toString()})`;
    }
  } else if (name) {
    if (statusCode) {
      return `${name} (${statusCode.toString()})`;
    } else {
      return name;
    }
  } else if (statusCode) {
    return statusCode.toString();
  } else {
    return '';
  }
}
