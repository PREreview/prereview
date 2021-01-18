import React from 'react';
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';

const Button = ({ className, active, reversed, ...props }) => {
  return (
    <span
      {...props}
      className={jsx(
        className,
        css`
          cursor: pointer;
          color: ${reversed
            ? active
              ? 'white'
              : '#aaa'
            : active
            ? 'black'
            : '#ccc'};
        `,
      )}
    />
  );
};

Button.propTypes = {
  className: PropTypes.string,
  active: PropTypes.bool,
  reversed: PropTypes.bool,
};

export default Button;
