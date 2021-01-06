// base imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { Helmet } from 'react-helmet-async';

// utils
import { usePostRequests } from '../hooks/api-hooks.tsx';
import { checkIfRoleLacksMininmalData } from '../utils/roles';

// components
import Button from './button';
import Controls from './controls';
import LoginRequiredModal from './login-required-modal';
import ModerationModal from './moderation-modal';
import PreprintPreview from './preprint-preview';
import ReviewReader from './review-reader';
import ReviewStepper from './review-stepper';

// !! this needs to work both in web and extension use
// `process.env.IS_EXTENSION` to assess the environment we are in.

export default function ShellContent({
  preprint,
  user,
  defaultTab = 'read',
  onRequireScreen,
}) {
  const location = useLocation();

  const {
    mutate: postReviewRequest,
    loadingPostReviewRequest,
    errorPostReviewRequest,
  } = usePostRequests({ pid: preprint.id });

  const [hasRapidReviewed, setHasRapidReviewed] = useState(false);
  const [hasLongReviewed, setHasLongReviewed] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [newRequest, setNewRequest] = useState(false);

  const [tab, setTab] = useState(defaultTab);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const counts =
    preprint.requests.length +
    preprint.rapidReviews.length +
    preprint.fullReviews.length;

  const [rapidContent, setRapidContent] = useState(null);

  const onCloseReviews = (rapidReview, longReview) => {
    if (rapidReview) {
      setRapidContent(rapidReview);
      setHasRapidReviewed(true);
    }

    if (longReview) {
      setLongContent(longReview);
      setHasLongReviewed(true);
    }
  };

  const [longContent, setLongContent] = useState('');
  const [initialContent, setInitialContent] = useState('');

  const onContentChange = value => {
    setInitialContent(value);
  };

  const onCloseRequest = () => {
    setNewRequest(true);
    setTab('read');
  };

  useEffect(() => {
    if (user) {
      preprint.fullReviews.map(review => {
        review.authors.map(author => {
          user.personas.some(persona => {
            if (persona.identity === author.identity) {
              if (review.published === true) {
                setHasLongReviewed(true);
              } else {
                setInitialContent(
                  review.drafts[review.drafts.length - 1].contents,
                );
              }
            }
          });
        });
      });

      preprint.rapidReviews.map(review => {
        user.personas.some(persona => {
          if (persona.identity === review.author.identity) {
            setHasRapidReviewed(true);
          }
        });
      });

      let author;

      preprint.requests.map(request => {
        request.author.id
          ? (author = request.author.id)
          : (author = request.author);
        setHasRequested(user.personas.some(persona => persona.id === author));
      });
    }
  }, [
    preprint,
    user,
    hasRapidReviewed,
    hasLongReviewed,
    rapidContent,
    longContent,
    hasRequested,
  ]);

  return (
    <div className="shell-content">
      {!process.env.IS_EXTENSION && (
        <Helmet>
          {/* Data for the extension popup menu */}
          <meta
            name="rapid-prereview-extension-nreviews"
            content={preprint.rapidReviews.length + preprint.fullReviews.length}
          />
          <meta
            name="rapid-prereview-extension-nrequests"
            content={preprint.requests.length}
          />
        </Helmet>
      )}

      <div className="shell-content__preview">
        <PreprintPreview preprint={preprint} />
      </div>

      <header className="shell-content__header">
        <nav>
          <ul>
            <li>
              <Button
                className={classNames('shell-content__tab-button', {
                  'shell-content__tab-button--active': tab === 'read',
                })}
                disabled={!preprint}
                onClick={() => {
                  onRequireScreen();
                  setTab('read');
                }}
              >
                Read reviews
              </Button>
            </li>
            <li>
              <Button
                className={classNames('shell-content__tab-button', {
                  'shell-content__tab-button--active': tab === 'reviews',
                })}
                disabled={!preprint}
                onClick={() => {
                  if (user) {
                    onRequireScreen();
                    setTab('reviews');
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
              >
                Add Review(s)
              </Button>
            </li>
            <li>
              <Button
                className={classNames('shell-content__tab-button', {
                  'shell-content__tab-button--active': tab === 'request',
                })}
                disabled={loadingPostReviewRequest || hasRequested}
                onClick={() => {
                  if (user) {
                    onRequireScreen();
                    setTab('request');
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
              >
                Add Request
              </Button>
            </li>
          </ul>
        </nav>
      </header>
      {isLoginModalOpen && (
        <LoginRequiredModal
          next={process.env.IS_EXTENSION ? undefined : location.pathname}
          onClose={() => {
            setIsLoginModalOpen(false);
          }}
        />
      )}
      <div className="shell-content__body">
        {tab === 'read' ? (
          <ShellContentRead
            user={user}
            preprint={preprint}
            counts={counts}
            rapidContent={rapidContent}
            longContent={longContent}
            newRequest={newRequest}
          />
        ) : tab === 'request' ? (
          <ShellContentRequest
            user={user}
            preprint={preprint}
            onSubmit={preprint => {
              postReviewRequest({ preprint: preprint })
                .then(() => {
                  alert('PREreview request submitted successfully.');
                  return onCloseRequest();
                })
                .catch(err => alert(`An error occurred: ${err.message}`));
            }}
            isPosting={loadingPostReviewRequest}
            disabled={hasRequested}
            error={errorPostReviewRequest} // #FIXME
          />
        ) : tab === 'reviews' ? (
          <ShellContentReviews
            user={user}
            preprint={preprint}
            onClose={onCloseReviews}
            onContentChange={onContentChange}
            hasRapidReviewed={hasRapidReviewed}
            hasLongReviewed={hasLongReviewed}
            initialContent={initialContent}
          />
        ) : tab === 'rapidReview#success' ? (
          <ShellContentReviewSuccess
            preprint={preprint}
            onClose={() => {
              setTab('read');
            }}
          />
        ) : tab === 'request#success' ? (
          <ShellContentRequestSuccess
            preprint={preprint}
            onClose={() => {
              setTab('read');
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

ShellContent.propTypes = {
  onRequireScreen: PropTypes.func.isRequired,
  preprint: PropTypes.object.isRequired,
  user: PropTypes.object,
  defaultTab: PropTypes.oneOf(['read', 'review', 'request']),
};

function ShellContentRead({
  user,
  preprint,
  counts,
  rapidContent,
  longContent,
  newRequest,
}) {
  // Note: !! this needs to work both in the webApp where it is URL driven and in
  // the extension where it is shell driven

  const [moderatedReviewId, setModeratedReviewId] = useState(null);
  const postReport = usePostRequests(preprint); // #FIXME should be PostReport() when built

  return (
    <div className="shell-content-read">
      <ReviewReader
        user={user}
        preprint={preprint}
        nRequests={counts}
        rapidContent={rapidContent}
        longContent={longContent}
        newRequest={newRequest}
      />
      {!!moderatedReviewId && (
        <ModerationModal
          title={`Report review as violating the Code of Conduct`}
          moderationProgress={postReport}
          onSubmit={(moderationReason, onSuccess) => {
            postReport(moderatedReviewId, moderationReason)
              .then(() => alert('Report submitted successfully.'))
              .catch(err => alert(`An error occurred: ${err.message}`));
            onSuccess();
          }}
          onCancel={() => {
            setModeratedReviewId(null);
          }}
        />
      )}
    </div>
  );
}
ShellContentRead.propTypes = {
  user: PropTypes.object,
  counts: PropTypes.number,
  preprint: PropTypes.object.isRequired,
  rapidContent: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  longContent: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  newRequest: PropTypes.bool,
};

function ShellContentReviews({
  preprint,
  disabled,
  onClose,
  onContentChange,
  hasRapidReviewed,
  hasLongReviewed,
  initialContent,
}) {
  return (
    <div className="shell-content-review">
      <ReviewStepper
        preprint={preprint}
        disabled={disabled}
        onClose={onClose}
        onContentChange={onContentChange}
        hasRapidReviewed={hasRapidReviewed}
        hasLongReviewed={hasLongReviewed}
        content={initialContent}
      />
    </div>
  );
}
ShellContentReviews.propTypes = {
  preprint: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onContentChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  hasLongReviewed: PropTypes.bool.isRequired,
  hasRapidReviewed: PropTypes.bool.isRequired,
  initialContent: PropTypes.string,
};

function ShellContentRequest({
  preprint,
  onSubmit,
  disabled,
  isPosting,
  error,
}) {
  return (
    <div className="shell-content-request">
      <header className="shell-content-request__title">
        Add a request for review
      </header>

      <Controls error={error}>
        <Button
          primary={true}
          isWaiting={isPosting}
          disabled={disabled}
          onClick={() => {
            onSubmit(preprint);
          }}
        >
          Submit
        </Button>
      </Controls>
    </div>
  );
}
ShellContentRequest.propTypes = {
  preprint: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isPosting: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
};

function ShellContentReviewSuccess({ preprint, onClose }) {
  return (
    <div className="shell-content-review-success">
      <header className="shell-content-review-success__title">Success</header>

      <PreprintPreview preprint={preprint} />

      <p>Your longform review has been successfully posted.</p>

      <Controls>
        <Button onClick={onClose}>View</Button>
      </Controls>
    </div>
  );
}
ShellContentReviewSuccess.propTypes = {
  preprint: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

function ShellContentRequestSuccess({ preprint, onClose }) {
  return (
    <div className="shell-content-request-success">
      <header className="shell-content-request-success__title">Success</header>

      <PreprintPreview preprint={preprint} />

      <p>Your request has been successfully posted.</p>

      <Controls>
        <Button onClick={onClose}>View</Button>
      </Controls>
    </div>
  );
}
ShellContentRequestSuccess.propTypes = {
  preprint: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};
