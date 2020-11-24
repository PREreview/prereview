import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { Helmet } from 'react-helmet-async';
import { MenuLink } from '@reach/menu-button';
import { useUser } from '../contexts/user-context';
import {
  GetUser, // #FIXME need to build get user reviews, requests
  PostPrereview, // #FIXME need to build PostReviewRequest
  // PostReport, // #FIXME need to build this
} from '../hooks/api-hooks.tsx';
import { useLocalState } from '../hooks/ui-hooks';
import Controls from './controls';
import Button from './button';
import RapidFormFragment from './rapid-form-fragment';
import LoginRequiredModal from './login-required-modal';
import UserBadge from './user-badge';
import SubjectEditor from './subject-editor';
import ReviewReader from './review-reader';
import PreprintPreview from './preprint-preview';
import XLink from './xlink';
import ModerationModal from './moderation-modal';
import { checkIfRoleLacksMininmalData } from '../utils/roles';
import NoticeBadge from './notice-badge';

// !! this needs to work both in web and extension use
// `process.env.IS_EXTENSION` to assess the environment we are in.

export default function ShellContent({
  preprint,
  defaultTab = 'read',
  onRequireScreen,
}) {
  const location = useLocation();
  const [user] = useUser();

  const postPrereview = PostPrereview();
  const postReviewRequest = PostPrereview(); // #FIXME PostReviewRequest();

  const [tab, setTab] = useState(defaultTab);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const hasReviewed = user && user.preprint ? user.preprint.review : false; // #FIXME
  const hasRequested = user && user.preprint ? user.preprint.request : false; // #FIXME

  const counts = () => {
    if (preprint.data[0].requests && preprint.data[0].reviews) {
      return preprint.data[0].requests.length + preprint.data[0].reviews.length;
    } else if (preprint.data[0].requests) {
      return preprint.data[0].requests.length;
    } else if (preprint.data[0].reviews) {
      return preprint.data[0].reviews.length;
    } else {
      return 0;
    }
  };

  const loginUrl = process.env.IS_EXTENSION
    ? '/login'
    : `/login?next=${encodeURIComponent(location.pathname)}`;

  const showProfileNotice = checkIfRoleLacksMininmalData(user);

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
                disabled={postReviewRequest.loading}
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
                  'shell-content__tab-button--active': tab === 'review',
                })}
                disabled={postReviewRequest.loading || hasReviewed}
                onClick={() => {
                  if (user) {
                    onRequireScreen();
                    setTab('review');
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
              >
                Add Review
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
          <ShellContentRead
            user={user}
            preprint={preprint}
            counts={counts()}
          />
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
        ) : tab === 'review' ? (
          <ShellContentReview
            user={user}
            preprint={preprint}
            onSubmit={() => {
              postPrereview(user, preprint)
                .then(() => alert('PREreview request submitted successfully.'))
                .catch(err => alert(`An error occurred: ${err}`));
            }}
            isPosting={postPrereview.loading}
            disabled={postPrereview.loading}
            error={postPrereview.error} // #FIXME
          />
        ) : tab === 'review#success' ? (
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
  defaultTab: PropTypes.oneOf(['read', 'review', 'request']),
};

function ShellContentRead({ user, preprint, counts }) {
  // Note: !! this needs to work both in the webApp where it is URL driven and in
  // the extension where it is shell driven

  const [moderatedReviewId, setModeratedReviewId] = useState(null);
  const postReport = PostPrereview(); // #FIXME should be PostReport() when built

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
              .then(() => alert('Reort submitted successfully.'))
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

function ShellContentReview({ user, preprint, disabled, isPosting, error }) {
  const [subjects, setSubjects] = useLocalState(
    'subjects',
    user.defaultRole,
    preprint.id,
    [],
  );
  const [answerMap, setAnswerMap] = useLocalState(
    'answerMap',
    user.defaultRole,
    preprint.id,
    {},
  );

  const postPrereview = PostPrereview();

  const canSubmit = () => {
    // #TODO build function to check if all questions have been answered
  };

  return (
    <div className="shell-content-review">
      <header className="shell-content-review__title">Add a review</header>

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

        <Controls error={error}>
          <Button
            type="submit"
            primary={true}
            isWaiting={isPosting}
            disabled={disabled || !canSubmit}
            onClick={() => {
              postPrereview(user, preprint)
                .then(() => alert('User updated successfully.'))
                .catch(err => alert(`An error occurred: ${err}`));
            }}
          >
            Submit
          </Button>
        </Controls>
      </form>
    </div>
  );
}
ShellContentReview.propTypes = {
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

      <p>Your review has been successfully posted.</p>

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
