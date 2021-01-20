import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Modal from './modal';
import Button from './button';
import Org from './org';

export default function WelcomeModal(props) {
  return (
    <Modal
      showCloseButton={false}
      className="welcome-modal"
      aria-label="welcome"
      {...props}
    >
      <div className="welcome-modal__content">
        <header className="welcome-modal__banner">
          <div className="welcome-modal__banner__background" />
        </header>
        <div className="welcome-modal__body">
          <h2 className="welcome-modal__title">
            Welcome to <Org />
          </h2>

          <p>
            This platform was designed to facilitate rapid and long-form, open
            review of preprints.
          </p>
          <div>
            Here you can:
            <ol>
              <li>Find rapid and long-form reviews of existing preprints.</li>
              <li>
                Request reviews of preprints (your own, or preprints you are
                interested in).
              </li>
              <li>
                Review preprints (as an individual, with a mentor, or in
                collaboration with co-reviewers).
              </li>
            </ol>
          </div>

          <div className="welcome-modal__controls">
            <Button pill={true} primary={true} onClick={props.onClose}>
              Get Started
            </Button>
            <Link className="welcome-modal__get-app" to="/extension">
              Get Extension
            </Link>
          </div>
        </div>
        <div className="welcome-modal__logo-row">
          {/* <PrereviewLogo /> <OutbreakSciLogo /> */}
        </div>
      </div>
    </Modal>
  );
}

WelcomeModal.propTypes = {
  onClose: PropTypes.func,
};
