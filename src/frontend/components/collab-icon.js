import React from 'react';
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';

const Icon = ({ className, ...props }) => {
  return (
    <span
      {...props}
      className={jsx(
        'material-icons',
        className,
        css`
          font-size: 18px;
          vertical-align: text-bottom;
        `,
      )}
    />
  );
};

Icon.propTypes = {
  className: PropTypes.string,
};

export default Icon;
