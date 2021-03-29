// base imports
import React, { createRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';

// material UI imports
import TextField from '@material-ui/core/TextField';

export default function TextInput({
  label,
  inputId,
  type = 'text',
  onChange = noop,
  ...inputProps
}) {
  /**
   * For accessability reasons, this component uses the label as a better
   * alternative to the 'placeholder' attr
   * see: https://www.smashingmagazine.com/2018/06/placeholder-attribute/
   */

  const inputRef = createRef();

  useEffect(() => {}, [inputRef]);

  return (
    <TextField
      variant="outlined"
      label={label}
      ref={inputRef}
      id={inputId}
      type={type}
      onChange={e => onChange(e)}
      {...inputProps}
    />
  );
}

TextInput.propTypes = {
  type: PropTypes.string,
  label: PropTypes.any,
  inputId: PropTypes.string,
  onChange: PropTypes.func,
};
