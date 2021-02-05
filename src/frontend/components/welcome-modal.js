import React from 'react';
import PropTypes from 'prop-types';
import Modal from './modal';
import Button from './button';
import PreReviewLogo from './pre-review-logo';


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
          <PreReviewLogo />
        </header>
        <div className="welcome-modal__body" align='center'>
            <div><b>Welcome to the new PREreview.org, a site for crowdsourcing preprint reviews.</b></div>
            <br/>
          <div>
            This is the marriage between two preprint review platforms: <em>PREreview.org</em> and <em>outbreaksci.prereview.org</em>. 
            If you were a user of either of these platforms, your information has been migrated to this new site. 
            If you are a new user, welcome to the family!
          </div>
          <br/>
          <div>
            On this platform, you can:
            <ol>
              <li>Read rapid and long-form reviews of existing preprints.</li>
              <li>
                Request reviews of preprints (your own, or preprints in which you are interested in seeing community feedback).
              </li>
              <li>
                Review preprints (as an individual, with a mentor, or in collaboration with co-reviewers).
              </li>
              <li>
                Find and join communities that are reviewing and discussing research relevant to you or start your own community.
              </li>
            </ol>
          </div>

          <div className="welcome-modal__controls">
            <Button pill={true} primary={true} onClick={props.onClose}>
              Get Started
            </Button>

          </div>
        </div>
      </div>
    </Modal>
  );
}

WelcomeModal.propTypes = {
  onClose: PropTypes.func,
};
