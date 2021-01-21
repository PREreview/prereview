// base imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useHistory } from 'react-router-dom';
import identifiersArxiv from 'identifiers-arxiv';
import doiRegex from 'doi-regex';

// utils
import { unversionDoi } from '../utils/ids';
import { unprefix } from '../utils/jsonld';

// hooks
import { usePreprint } from '../hooks/old-hooks';
import { usePostRequests } from '../hooks/api-hooks.tsx';

// components
import Controls from './controls';
import Button from './button';
import TextInput from './text-input';
import PreprintPreview from './preprint-preview';

export default function NewPreprint({ user, onCancel, onSuccess }) {
  const location = useLocation(); // location.state can be {preprint, tab, isSingleStep} with tab being `request` or `review` (so that we know on which tab the shell should be activated with
  const qs = new URLSearchParams(location.search);

  const isSingleStep = location.state && location.state.isSingleStep;

  const [{ identifier, url }, setIdentifierAndUrl] = useState({
    identifier:
      qs.get('identifier') ||
      (location.state &&
        location.state.preprint &&
        location.state.preprint.doi) ||
      (location.state &&
        location.state.preprint &&
        location.state.preprint.arXivId) ||
      '',
    url:
      (location.state &&
        location.state.preprint &&
        location.state.preprint.url) ||
      null,
  });

  const [preprint, resolvePreprintStatus] = usePreprint(
    identifier,
    location.state && location.state.preprint,
    url,
  );

  const [step, setStep] = useState(
    location.state && location.state.tab === 'reviews'
      ? 'NEW_REVIEW'
      : location.state && location.state.tab === 'request'
      ? 'NEW_REQUEST'
      : 'NEW_PREPRINT',
  );

  return (
    <div className="new-preprint">
      {step === 'NEW_PREPRINT' ? (
        <StepPreprint
          user={user}
          onCancel={onCancel}
          onStep={setStep}
          onIdentifier={(identifier, url = null) => {
            setIdentifierAndUrl({ identifier, url });
          }}
          identifier={identifier}
          preprint={preprint}
          resolvePreprintStatus={resolvePreprintStatus}
        />
      ) : null}
    </div>
  );
}
NewPreprint.propTypes = {
  user: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

function StepPreprint({
  onCancel,
  onIdentifier,
  identifier,
  preprint,
  resolvePreprintStatus,
}) {
  const history = useHistory();
  const location = useLocation();

  const [error, setError] = useState(false);
  const [value, setValue] = useState(unprefix(identifier));

  // const hasReviewed = checkIfHasReviewed(user, actions);
  // const hasRequested = checkIfHasRequested(user, actions);

  // Note: biorXiv use versioned DOI in URL but do not register those DOIs with
  // doi.org => they 404 when we dereference them
  // => here if the doi is a versioned one, we offer the user to try with the
  // unversionned DOI
  const doiMatch = value && value.match(doiRegex());
  const doi = doiMatch && doiMatch[0];
  const unversionedDoi = unversionDoi(value);

  const url = /^\s*https?:\/\//.test(value) ? value.trim() : undefined;

  return (
    <div className="new-preprint__step-preprint">
      <div className="new-preprint__input-row">
        <TextInput
          inputId="step-preprint-input-new"
          label={
            <span>
              Enter preprint <abbr title="Digital Object Identifier">DOI</abbr>{' '}
              or an arXiv ID
            </span>
          }
          minimal={true}
          autoComplete="off"
          placeholder=""
          onChange={event => {
            const value = event.target.value;
            if (value) {
              const qs = new URLSearchParams(value);
              if (qs.get('identifier')) {
                qs.delete('identifier');
                history.replace({
                  pathname: location.pathname,
                  search: qs.toString(),
                });
              }
            }

            const [arxivId] = identifiersArxiv.extract(value);
            let nextIdentifier;
            if (arxivId) {
              nextIdentifier = arxivId;
            } else {
              const doiMatch = value.match(doiRegex());
              const doi = doiMatch && doiMatch[0];
              if (doi) {
                nextIdentifier = doi;
              } else {
                nextIdentifier = '';
                value === '' ? setError(false) : setError(true);
              }
            }

            if (nextIdentifier !== identifier) {
              onIdentifier(nextIdentifier, url);
            }

            setValue(value);
          }}
          value={value}
        />
      </div>

      {preprint ? (
        <PreprintPreview preprint={preprint} />
      ) : resolvePreprintStatus.isActive ? (
        <p>{`resolving ${identifier}`}</p>
      ) : resolvePreprintStatus.error &&
        resolvePreprintStatus.error.statusCode === 404 &&
        unversionedDoi &&
        unversionedDoi !== doi ? (
        <p>
          Could not find an entry corresponding to <code>{doi}</code>. Try with{' '}
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              onIdentifier(unversionedDoi, url);
              setValue(unversionedDoi);
            }}
          >
            {unversionedDoi}
          </a>{' '}
          ?
        </p>
      ) : null}

      {resolvePreprintStatus.loading && (
        <p>Checking for existing reviews or requests for reviews…</p>
      )}

      <Controls
        className="new-preprint__button-bar"
        error={error || resolvePreprintStatus.error}
      >
        <Button
          onClick={() => {
            setValue('');
            onIdentifier('');
            onCancel();
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            history.push(`/preprints/${preprint.id}`, {
              tab: 'request',
              isSingleStep: true,
            });
          }}
          disabled={!identifier || !preprint}
        >
          Request reviews
        </Button>
        <Button
          onClick={() => {
            history.push(`/preprints/${preprint.id}`, {
              tab: 'reviews',
              isSingleStep: true,
            });
          }}
          disabled={!identifier || !preprint}
        >
          Add reviews
        </Button>
      </Controls>
    </div>
  );
}
StepPreprint.propTypes = {
  user: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onStep: PropTypes.func.isRequired,
  onIdentifier: PropTypes.func.isRequired,
  identifier: PropTypes.string,
  preprint: PropTypes.object,
  resolvePreprintStatus: PropTypes.object,
};

function StepRequest({ isSingleStep, preprint, onCancel, onSuccess }) {
  const {
    mutate: postReviewRequest,
    loadingPostReviewRequest,
    errorPostReviewRequest,
  } = usePostRequests({ preprint: preprint.id });

  return (
    <div className="new-preprint__step-request">
      <header className="new-preprint__title">
        Please confirm your request for review:
      </header>

      <PreprintPreview preprint={preprint} />

      <Controls
        error={errorPostReviewRequest}
        className="new-preprint__button-bar"
      >
        <Button
          onClick={() => {
            onCancel();
          }}
          disabled={loadingPostReviewRequest}
        >
          {isSingleStep ? 'Cancel' : 'Go Back'}
        </Button>

        <Button
          primary={true}
          isWaiting={loadingPostReviewRequest}
          onClick={() => {
            postReviewRequest({ preprint: preprint })
              .then(() => {
                alert('Request for reviews submitted succesfully.');
                return onSuccess();
              })
              .catch(err => alert(`An error occured: ${err.message}`));
          }}
          disabled={loadingPostReviewRequest}
        >
          Submit
        </Button>
      </Controls>
    </div>
  );
}
StepRequest.propTypes = {
  isSingleStep: PropTypes.bool,
  preprint: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

function StepReviewSuccess({ preprint, onClose, onViewInContext }) {
  return (
    <div className="new-preprint__step-review-success">
      <header className="new-preprint__title">Success</header>

      <PreprintPreview preprint={preprint} />

      <p>Your review has been successfully posted.</p>

      <Controls>
        <Button
          onClick={() => {
            onViewInContext({ preprint, tab: 'read' });
          }}
        >
          View In Context
        </Button>
        <Button onClick={onClose}>Close</Button>
      </Controls>
    </div>
  );
}
StepReviewSuccess.propTypes = {
  preprint: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onViewInContext: PropTypes.func.isRequired
};

function StepRequestSuccess({ preprint, onClose, onViewInContext }) {
  return (
    <div className="new-preprint__step-review-success">
      <header className="new-preprint__title">Success</header>

      <PreprintPreview preprint={preprint} />

      <p>Your request has been successfully posted.</p>

      <Controls>
        <Button
          onClick={() => {
            onViewInContext({ preprint, tab: 'read' });
          }}
        >
          View In Context
        </Button>
        <Button onClick={onClose}>Close</Button>
      </Controls>
    </div>
  );
}
StepRequestSuccess.propTypes = {
  preprint: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onViewInContext: PropTypes.func.isRequired
};
