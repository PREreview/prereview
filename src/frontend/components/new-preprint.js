import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useHistory } from 'react-router-dom';
import identifiersArxiv from 'identifiers-arxiv';
import doiRegex from 'doi-regex';
import { unversionDoi } from '../utils/ids';
import { unprefix } from '../utils/jsonld';
import {
  useGetPreprint,
  useGetUser,
  usePostPreprints,
  // usePostRapidReview,
  // usePostFullReview
} from '../hooks/api-hooks.tsx';
import { useLocalState } from '../hooks/ui-hooks';
import SubjectEditor from './subject-editor';
import RapidFormFragment from './rapid-form-fragment';
import { UserProvider } from '../contexts/user-context';
import Controls from './controls';
import Button from './button';
import TextInput from './text-input';
import PreprintPreview from './preprint-preview';

export default function NewPreprint({
  user,
  onCancel,
  onSuccess,
  onViewInContext,
}) {
  const location = useLocation(); // location.state can be {preprint, tab, isSingleStep} with tab being `request` or `review` (so that we know on which tab the shell should be activated with)
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

  const preprint = useGetPreprint(
    identifier,
    location.state && location.state.preprint,
    url,
  );

  const [step, setStep] = useState(
    location.state && location.state.tab === 'review'
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
            console.log({ identifier, url });
            setIdentifierAndUrl({ identifier, url });
          }}
          identifier={identifier}
          preprint={preprint}
          onViewInContext={onViewInContext}
        />
      ) : preprint && step === 'NEW_REVIEW' ? (
        <StepReview
          isSingleStep={isSingleStep}
          onCancel={() => {
            if (isSingleStep) {
              onCancel();
            } else {
              setStep('NEW_PREPRINT');
            }
          }}
          preprint={preprint}
          onSuccess={() => {
            setStep('REVIEW_SUCCESS');
          }}
          onViewInContext={onViewInContext}
        />
      ) : preprint && step === 'NEW_REQUEST' ? (
        <StepRequest
          isSingleStep={isSingleStep}
          onCancel={() => {
            if (isSingleStep) {
              onCancel();
            } else {
              setStep('NEW_PREPRINT');
            }
          }}
          preprint={preprint}
          onSuccess={() => {
            setStep('REQUEST_SUCCESS');
          }}
          onViewInContext={onViewInContext}
        />
      ) : preprint && step === 'REVIEW_SUCCESS' ? (
        <StepReviewSuccess
          preprint={preprint}
          onClose={() => {
            onSuccess(preprint);
          }}
          onViewInContext={onViewInContext}
        />
      ) : preprint && step === 'REQUEST_SUCCESS' ? (
        <StepRequestSuccess
          preprint={preprint}
          onClose={() => {
            onSuccess(preprint);
          }}
          onViewInContext={onViewInContext}
        />
      ) : null}
    </div>
  );
}
NewPreprint.propTypes = {
  user: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onViewInContext: PropTypes.func.isRequired,
};

function StepPreprint({
  user,
  onCancel,
  onStep,
  onIdentifier,
  identifier,
  preprint,
  onViewInContext,
}) {
  const history = useHistory();
  const location = useLocation();

  const [value, setValue] = useState(unprefix(identifier));

  const hasReviewed = useGetUser(user, preprint); // #FIXME
  const hasRequested = useGetUser(user, preprint); // #FIXME

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
          onChange={e => {
            if (location.search) {
              const qs = new URLSearchParams(location.search);
              if (qs.get('identifier')) {
                history.replace('/new');
              }
            }

            const value = e.target.value;
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
      ) : preprint.loading ? (
        <p>{`resolving ${identifier}`}</p>
      ) : preprint.error && unversionedDoi && unversionedDoi !== doi ? (
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

      {preprint.loading && (
        <p>Checking for existing reviews or requests for reviews…</p>
      )}

      <Controls
        className="new-preprint__button-bar"
        error={preprint.error} // #FIXME
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
            onStep('NEW_REQUEST');
          }}
          disabled={
            preprint.loading || hasRequested || !identifier || !preprint
          }
        >
          Request reviews
        </Button>
        <Button
          onClick={() => {
            onViewInContext({
              preprint,
              tab: 'review',
            });
          }}
          disabled={preprint.loading || hasReviewed || !identifier || !preprint}
        >
          Add review
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
  onViewInContext: PropTypes.func.isRequired,
};

function StepReview({ preprint, onViewInContext, onCancel, isSingleStep }) {
  const [user] = UserProvider();
  const postRapidReview = usePostRapidReview();
  const postFullReview = usePostFullReview();
  const [subjects, setSubjects] = useLocalState(
    'subjects',
    user.defaultRole,
    preprint,
    [],
  );
  const [answerMap, setAnswerMap] = useLocalState(
    'answerMap',
    user.defaultRole,
    preprint,
    {},
  );

  const canSubmit = GetUserReview(answerMap);

  return (
    <div className="new-preprint__step-review">
      <header className="new-preprint__title">Add a review</header>

      <PreprintPreview preprint={preprint} />

      <form
        onSubmit={e => {
          e.preventDefault();
        }}
      >
        <SubjectEditor
          subjects={subjects}
          onAdd={subject => {
            setSubjects(
              subjects.concat(subject).sort((a, b) => {
                return (a.alternateName || a.name).localeCompare(
                  b.alternateName || b.name,
                );
              }),
            );
          }}
          onDelete={subject => {
            setSubjects(
              subjects.filter(_subject => _subject.name !== subject.name),
            );
          }}
        />

        <RapidFormFragment
          answerMap={answerMap}
          onChange={(key, value) => {
            setAnswerMap(prev => {
              return Object.assign({}, prev, { [key]: value });
            });
          }}
        />

        <Controls
          error={postPrereview.FIXME}
          className="new-preprint__button-bar"
        >
          <Button
            onClick={() => {
              onCancel();
            }}
            disabled={postPrereview.loading}
          >
            {isSingleStep ? 'Cancel' : 'Go Back'}
          </Button>

          <Button
            onClick={() => {
              onViewInContext({
                preprint,
                tab: 'review',
              });
            }}
            disabled={postPrereview.loading}
          >
            View In Context
          </Button>
          <Button
            primary={true}
            onClick={() => {
              postPrereview(preprint)
                .then(() => alert('PREreview posted successfully.'))
                .catch(err => `An error occurred: ${err}`);
            }}
            isWaiting={postPrereview.loading}
            disabled={postPrereview.loading || !canSubmit}
          >
            Submit
          </Button>
        </Controls>
      </form>
    </div>
  );
}
StepReview.propTypes = {
  isSingleStep: PropTypes.bool,
  preprint: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onViewInContext: PropTypes.func.isRequired,
};

function StepRequest({ isSingleStep, preprint, onCancel }) {
  const postPreprint = PostPreprint();

  return (
    <div className="new-preprint__step-request">
      <header className="new-preprint__title">Confirm Review Request</header>

      <PreprintPreview preprint={preprint} />

      <Controls error={postPreprint.FIXME} className="new-preprint__button-bar">
        <Button
          onClick={() => {
            onCancel();
          }}
          disabled={postPreprint.loading}
        >
          {isSingleStep ? 'Cancel' : 'Go Back'}
        </Button>

        <Button
          primary={true}
          isWaiting={postPreprint.loading}
          onClick={() => {
            postPreprint(preprint)
              .then(() => alert('Preprint added successfully.'))
              .catch(err => alert(`An error occurred: ${err}`));
          }}
          disabled={postPreprint.loading}
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
  onViewInContext: PropTypes.func.isRequired,
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
  onViewInContext: PropTypes.func.isRequired,
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
  onViewInContext: PropTypes.func.isRequired,
};
