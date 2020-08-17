import React from 'react';
import Button from './button';
import icon from '../svgs/add_prereview_icon.svg';
import './add-button.css';

export default function AddButton({ ...buttonProps }) {
  return (
    <Button className="add-button" {...buttonProps} pill={true} primary={true}>
      <div className="add-button__icon-container">
        <img src={icon} aria-hidden="true" alt="" />
      </div>
      <div className="add-button__left">Add Review</div>
      <div className="add-button__right">Request Review</div>
    </Button>
  );
}
