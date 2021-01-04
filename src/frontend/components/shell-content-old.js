import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { Helmet } from 'react-helmet-async';
import {
  usePostFullReviews,
  usePostRapidReviews,
  usePostRequests,
} from '../hooks/api-hooks.tsx';
import Controls from './controls';
import Button from './button';
import RapidFormFragment from './rapid-form-fragment';
import LongFormFragment from './long-form-fragment';
import LoginRequiredModal from './login-required-modal';
import ReviewReader from './review-reader';
import PreprintPreview from './preprint-preview';
import ModerationModal from './moderation-modal';

// constants
import { QUESTIONS } from '../constants';

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
  } = usePostRequests();

  const [hasRapidReviewed, setHasRapidReviewed] = useState(false);
  const [hasLongReviewed, setHasLongReviewed] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  const [tab, setTab] = useState(defaultTab);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const counts =
    preprint.requests.length +
    preprint.rapidReviews.length +
    preprint.fullReviews.length;

  const extensionNextURL = new URL(window.location.href);
  extensionNextURL.hash = '#osrpre-shell';


  const [rapidContent, setRapidContent] = useState(null);

  const onCloseRapid = review => {
    setRapidContent(review);
    setHasRapidReviewed(true);
    setTab('read');
  };

  const [longContent, setLongContent] = useState('');

  const onCloseLong = review => {
    setLongContent(review);
    setHasLongReviewed(true);
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
                setLongContent(review.drafts[review.drafts.length - 1].contents);
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
    }
  }, [preprint, user]);

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
                  'shell-content__tab-button--active': tab === 'rapidReview',
                })}
                disabled={!preprint || hasRapidReviewed}
                onClick={() => {
                  if (user) {
                    onRequireScreen();
                    setTab('rapidReview');
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
              >
                Add Rapid Review
              </Button>
            </li>
            <li>
              <Button
                className={classNames('shell-content__tab-button', {
                  'shell-content__tab-button--active': tab === 'longReview',
                })}
                disabled={!preprint || hasLongReviewed}
                onClick={() => {
                  if (user) {
                    onRequireScreen();
                    setTab('longReview');
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
              >
                Add Longform Review
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
            rapidContent={rapidContent || hasRapidReviewed}
            longContent={longContent || hasLongReviewed}
          />
        ) : tab === 'request' ? (
          <ShellContentRequest
            user={user}
            preprint={preprint}
            onSubmit={preprint => {
              postReviewRequest({ preprint: preprint})
                .then(() => {
                  alert('PREreview request submitted successfully.');
                  return setTab('read');
                })
                .catch(err => alert(`An error occurred: ${err.message}`));
            }}
            isPosting={loadingPostReviewRequest}
            disabled={hasRequested}
            error={errorPostReviewRequest} // #FIXME
          />
        ) : tab === 'rapidReview' ? (
          <ShellContentRapidReview
            user={user}
            preprint={preprint}
            disabled={hasRapidReviewed}
            onClose={onCloseRapid}
          />
        ) : tab === 'rapidReview#success' ? (
          <ShellContentReviewSuccess
            preprint={preprint}
            onClose={() => {
              setTab('read');
            }}
          />
        ) : tab === 'longReview' ? (
          <ShellContentLongReview
            user={user}
            preprint={preprint}
            onClose={onCloseLong}
            disabled={hasLongReviewed}
            initialContent={longContent}
          />
        ) : tab === 'longReview#success' ? (
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
}) {
  // Note: !! this needs to work both in the webApp where it is URL driven and in
  // the extension where it is shell driven

  const [moderatedReviewId, setModeratedReviewId] = useState(null);
  const postReport = usePostRequests(); // #FIXME should be PostReport() when built

  return (
    <div className="shell-content-read">
      <header className="shell-content-read__title">Reviews</header>

      <PreprintPreview preprint={preprint} />
      <ReviewReader
        user={user}
        preprint={preprint}
        nRequests={counts}
        rapidContent={rapidContent}
        longContent={longContent}
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
};

function ShellContentRapidReview({ preprint, disabled, onClose }) {
  const [answerMap, setAnswerMap] = useState({});

  const { mutate: postRapidReview, loading, error } = usePostRapidReviews();

  const canSubmit = answerMap => {
    return QUESTIONS.filter(q => q.type == 'YesNoQuestion').every(
      question => question.identifier in answerMap,
    );
  };

  return (
    <div className="shell-content-review">
      <header className="shell-content-review__title">Add a review</header>

      <PreprintPreview preprint={preprint} />

      <form>
        <RapidFormFragment
          answerMap={answerMap}
          onChange={(key, value) => {
            setAnswerMap(answerMap => ({ ...answerMap, [key]: value }));
          }}
        />
        <Controls error={error}>
          <Button
            type="submit"
            primary={true}
            isWaiting={loading}
            disabled={disabled || !canSubmit}
            onClick={event => {
              event.preventDefault();
              if (canSubmit(answerMap)) {
                postRapidReview({ ...answerMap, preprint: preprint.id })
                  .then(() => {
                    alert('Rapid review submitted successfully.');
                    return onClose(answerMap);
                  })
                  .catch(err => alert(`An error occurred: ${err.message}`));
              } else {
                alert(
                  'Please complete the required fields. All multiple choice questions are required.',
                );
              }
            }}
          >
            Submit
          </Button>
        </Controls>
      </form>
    </div>
  );
}
ShellContentRapidReview.propTypes = {
  user: PropTypes.object,
  preprint: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

function ShellContentLongReview({
  initialContent,
  preprint,
  disabled,
  isPosting,
  error,
  onClose,
}) {
  const [content, setContent] = useState('');
  const {
    mutate: postLongReview,
    loadingPostLongReview,
  } = usePostFullReviews();

  const onContentChange = value => {
    setContent(value);
  };

  const canSubmit = content => {
    return content && content !== '<p></p>';
  };

  return (
    <div className="shell-content-review">
      <header className="shell-content-review__title">
        Add a longform review
      </header>

      <PreprintPreview preprint={preprint} />

      <form>
        <LongFormFragment
          onContentChange={onContentChange}
          content={initialContent}
        />

        <Controls error={error}>
          <Button
            type="submit"
            primary={true}
            isWaiting={isPosting}
            disabled={disabled || !canSubmit(content)}
            onClick={event => {
              event.preventDefault();
              if (canSubmit(content)) {
                postLongReview({
                  preprint: preprint.id,
                  contents: content,
                })
                  .then(() => alert('Draft updated successfully.'))
                  .catch(err => alert(`An error occurred: ${err.message}`));
              } else {
                alert('Review cannot be blank.');
              }
            }}
          >
            Save
          </Button>
          <Button
            type="submit"
            primary={true}
            isWaiting={isPosting}
            disabled={disabled || !canSubmit(content)}
            onClick={event => {
              event.preventDefault();
              if (canSubmit(content)) {
                if (
                  confirm(
                    'Are you sure you want to publish this review? This action cannot be undone.',
                  )
                ) {
                  postLongReview({
                    preprint: preprint.id,
                    contents: content,
                    published: true,
                  })
                    .then(() => {
                      alert('Full review submitted successfully.');
                      return onClose(content);
                    })
                    .catch(err => alert(`An error occurred: ${err.message}`));
                }
              } else {
                alert('Review cannot be blank.');
              }
            }}
          >
            Submit
          </Button>
        </Controls>
      </form>
    </div>
  );
}
ShellContentLongReview.propTypes = {
  preprint: PropTypes.object.isRequired,
  isPosting: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
  onClose: PropTypes.func.isRequired,
  initialContent: PropTypes.string.isRequired,
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

      <PreprintPreview preprint={preprint} />

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
