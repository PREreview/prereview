import React from 'react';
import PropTypes from 'prop-types';
import './label-style.css';

export default function LabelStyle({ children }) {
  return <span className="label-style">{children}</span>;
}

LabelStyle.propTypes = {
  children: PropTypes.any,
};
