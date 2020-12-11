import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { Helmet } from 'react-helmet-async';
import { MenuLink } from '@reach/menu-button';
import {
  useGetFullReview,
  useGetRapidReview,
  usePostFullReviews,
  usePostRapidReviews,
  usePostRequests,
} from '../hooks/api-hooks.tsx';
import Controls from './controls';
import Button from './button';
import RapidFormFragment from './rapid-form-fragment';
import LongFormFragment from './long-form-fragment';
import LoginRequiredModal from './login-required-modal';
import UserBadge from './user-badge';
import ReviewReader from './review-reader';
import PreprintPreview from './preprint-preview';
import XLink from './xlink';
import ModerationModal from './moderation-modal';
import { checkIfRoleLacksMininmalData } from '../utils/roles';
import NoticeBadge from './notice-badge';

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

  const postReviewRequest = usePostRequests();

  const { data: rapidReview, loadingRapid, errorRapid } = useGetRapidReview({
    author: user.id,
    preprint: preprint.id,
  });

  const { data: longReview, loadingLong, errorLong } = useGetFullReview({
    author: user ? user.id : null,
    preprint: preprint ? preprint.id : null,
  });

  const [hasRapidReviewed, setHasRapidReviewed] = useState(false);
  const [hasLongReviewed, setHasLongReviewed] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  const [tab, setTab] = useState(defaultTab);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const counts =
    preprint.requests.length +
    preprint.rapidReviews.length +
    preprint.fullReviews.length;

  const loginUrl = process.env.IS_EXTENSION
    ? '/login'
    : `/login?next=${encodeURIComponent(location.pathname)}`;

  const showProfileNotice = checkIfRoleLacksMininmalData(user);

  useEffect(() => {
    if (!loadingRapid) {
      if (rapidReview) {
        setHasRapidReviewed(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!loadingLong) {
      if (longReview) {
        setHasLongReviewed(true);
      }
    }
  }, []);

  return (
    <div className="shell-content">
      {!process.env.IS_EXTENSION && (
        <Helmet>
          {/* Data for the extension popup menu */}
          <meta
            name="rapid-prereview-extension-nreviews"
            content={counts.nReviews}
          />
          <meta
            name="rapid-prereview-extension-nrequests"
            content={counts.nRequests}
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
                disabled={loadingRapid || hasRapidReviewed}
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
                disabled={loadingLong || hasLongReviewed}
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
                disabled={postReviewRequest.loading || hasRequested}
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

        {user ? (
          <UserBadge
            className="shell-content__user"
            user={user}
            showNotice={showProfileNotice}
          >
            {showProfileNotice && (
              <MenuLink
                as={process.env.IS_EXTENSION ? undefined : Link}
                to={process.env.IS_EXTENSION ? undefined : '/settings'}
                href={process.env.IS_EXTENSION ? `settings` : undefined}
                target={process.env.IS_EXTENSION ? '_blank' : undefined}
              >
                Complete Profile
                <div className="menu__link-item__icon">
                  <NoticeBadge />
                </div>
              </MenuLink>
            )}

            <MenuLink
              as={process.env.IS_EXTENSION ? undefined : Link}
              to={process.env.IS_EXTENSION ? undefined : '/settings'}
              href={process.env.IS_EXTENSION ? `settings` : undefined}
              target={process.env.IS_EXTENSION ? '_blank' : undefined}
            >
              User Settings
            </MenuLink>

            {user.isAdmin && (
              <MenuLink
                as={process.env.IS_EXTENSION ? undefined : Link}
                to={process.env.IS_EXTENSION ? undefined : '/admin'}
                href={process.env.IS_EXTENSION ? `admin` : undefined}
                target={process.env.IS_EXTENSION ? '_blank' : undefined}
              >
                Admin Settings
              </MenuLink>
            )}

            {user.isAdmin && (
              <MenuLink
                as={process.env.IS_EXTENSION ? undefined : Link}
                to={process.env.IS_EXTENSION ? undefined : '/block'}
                href={process.env.IS_EXTENSION ? `block` : undefined}
                target={process.env.IS_EXTENSION ? '_blank' : undefined}
              >
                Moderate Users
              </MenuLink>
            )}

            {!!(user && user.isModerator && !user.isModerated) && (
              <MenuLink
                as={process.env.IS_EXTENSION ? undefined : Link}
                to={process.env.IS_EXTENSION ? undefined : '/moderate'}
                href={process.env.IS_EXTENSION ? `moderate` : undefined}
                target={process.env.IS_EXTENSION ? '_blank' : undefined}
              >
                Moderate Reviews
              </MenuLink>
            )}

            <MenuLink href={`auth/logout`}>Logout</MenuLink>
          </UserBadge>
        ) : (
          <XLink href={loginUrl} to={loginUrl}>
            Login
          </XLink>
        )}
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
          <ShellContentRead user={user} preprint={preprint} counts={counts} />
        ) : tab === 'request' ? (
          <ShellContentRequest
            user={user}
            preprint={preprint}
            onSubmit={() => {
              postReviewRequest(user, preprint)
                .then(() => alert('PREreview request submitted successfully.'))
                .catch(err => alert(`An error occurred: ${err}`));
            }}
            isPosting={postReviewRequest.loading}
            disabled={postReviewRequest.loading}
            error={postReviewRequest.error} // #FIXME
          />
        ) : tab === 'rapidReview' ? (
          <ShellContentRapidReview
            user={user}
            preprint={preprint}
            onSubmit={() => {
              postReviewRequest(user, preprint)
                .then(() => alert('PREreview request submitted successfully.'))
                .catch(err => alert(`An error occurred: ${err}`));
              setTab('rapidReview#success');

            }}
            disabled={hasRapidReviewed}
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
            onSubmit={() => {
              postReviewRequest(user, preprint)
                .then(() => alert('PREreview request submitted successfully.'))
                .catch(err => alert(`An error occurred: ${err}`));
              setTab('longReview#success');
            }}
            disabled={hasLongReviewed}
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
  user: PropTypes.object.isRequired,
  defaultTab: PropTypes.oneOf(['read', 'review', 'request']),
};

function ShellContentRead({ user, preprint, counts }) {
  // Note: !! this needs to work both in the webApp where it is URL driven and in
  // the extension where it is shell driven

  const [moderatedReviewId, setModeratedReviewId] = useState(null);
  const postReport = usePostRequests(); // #FIXME should be PostReport() when built

  return (
    <div className="shell-content-read">
      <header className="shell-content-read__title">Reviews</header>

      <PreprintPreview preprint={preprint} />
      <ReviewReader user={user} preprint={preprint} nRequests={counts} />
      {!!moderatedReviewId && (
        <ModerationModal
          title={`Report review as violating the Code of Conduct`}
          moderationProgress={postReport}
          onSubmit={(moderationReason, onSuccess) => {
            postReport(moderatedReviewId, moderationReason)
              .then(() => alert('Report submitted successfully.'))
              .catch(err => alert(`An error occurred: ${err}`));
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
};

function ShellContentRapidReview({ preprint, disabled }) {
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
                postRapidReview({...answerMap, preprint: preprint.id})
                  .then(() => alert('Rapid review submitted successfully.'))
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
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

function ShellContentLongReview({
  user,
  preprint,
  disabled,
  isPosting,
  error,
}) {
  const [content, setContent] = useState('');
  const {
    mutate: postLongReview,
    loadingPostLongReview,
  } = usePostFullReviews();

  const onContentChange = value => {
    setContent(value);
  }

  const canSubmit = () => {
    // #TODO build function to check if all questions have been answered
  };

  return (
    <div className="shell-content-review">
      <header className="shell-content-review__title">
        Add a longform review
      </header>

      <PreprintPreview preprint={preprint} />

      <form>
        <LongFormFragment onContentChange={onContentChange} />

        <Controls error={error}>
          <Button
            type="submit"
            primary={true}
            isWaiting={isPosting}
            disabled={disabled || !canSubmit}
            onClick={event => {
              event.preventDefault();
              if (content && content !== '<p></p>') {
                postLongReview({
                  author: user.id,
                  preprint: preprint.id,
                  contents: content,
                })
                  .then(() => alert('Draft updated successfully.'))
                  .catch(err => alert(`An error occurred: ${err}`));
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
            disabled={disabled || !canSubmit}
            onClick={event => {
              event.preventDefault();
              if (content && content !== '<p></p>') {
                if (
                  alert(
                    'Are you sure you want to submit this review? This action cannot be undone.',
                  )
                ) {
                  postLongReview({
                    author: user.id,
                    preprint: preprint.id,
                    contents: content,
                    published: true,
                  })
                    .then(() => alert('Rapid review submitted successfully.'))
                    .catch(err => alert(`An error occurred: ${err}`));
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
  user: PropTypes.object,
  preprint: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isPosting: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
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
  user: PropTypes.object,
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
