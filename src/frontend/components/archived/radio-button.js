import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function RadioButton({
  inputId,
  label,
  className,
  disabled = false,
  required = false,
  ...inputProps
}) {
  const inputRef = createRef();

  return (
    <div
      className={classNames('radio-button', className, {
        'radio-button--disabled': disabled,
      })}
    >
      {/*  The label element is responsible for triggering the onChange callback
      of the radio-button since the native radio-button element will be visually hidden. */}
      <label htmlFor={inputId} className="radio-button__contents">
        <span className="radio-button__label vh">{label}</span>
      </label>
      <input
        className="radio-button__input"
        disabled={disabled}
        required={required}
        id={inputId}
        type="radio"
        ref={inputRef}
        {...inputProps}
      />
    </div>
  );
}

RadioButton.propTypes = {
  inputId: PropTypes.string,
  label: PropTypes.any,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
};
