// base imports
import React from 'react';
import PropTypes from 'prop-types';

// MaterialUI imports
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';

export default function ToggleSwitch({
  id,
  checked,
  disabled,
  onChange,
  label,
}) {
  return (
    <>
      <FormControlLabel
        control={
          <Switch
            disabled={disabled}
            id={id}
            checked={checked}
            onChange={onChange}
          />
        }
        label={<Typography variant="srOnly">{label}</Typography>}
      />
    </>
  );
}

ToggleSwitch.propTypes = {
  id: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
};
