// base imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { Helmet } from 'react-helmet-async';

// material ui
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';

// utils
import { usePostRequests } from '../hooks/api-hooks.tsx';

// components
import Button from './button';
import Controls from './controls';
import LoginRequiredModal from './login-required-modal';
import ModerationModal from './moderation-modal';
import PreprintPreview from './preprint-preview';
import ReviewReader from './review-reader';
import ReviewStepper from './review-stepper';

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
  },
  yellow: {
    backgroundColor: '#FFFAEE',
    padding: 10,
  },
}));

export default function ShellContent({
  preprint,
  user,
  defaultTab = 'read',
  onRequireScreen,
}) {
  const location = useLocation();
  const [height, setHeight] = useState(0);

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
    const newHeight = document.getElementsByClassName(
      'shell-content__preview',
    )[0].clientHeight;
    setHeight(newHeight + 20);
  }, []);

  useEffect(() => {
    if (user) {
      if (preprint.fullReviews.length) {
        // gets an array of the active user's persona IDs
        let personaIDs = user.personas.map(persona => persona.id); 

        // collects the user's reviews for the current preprint, whether published or not
        let ownReviews = []; 
        preprint.fullReviews.map(review => {
          review.authors.map(author => {
            let authorID;
            author.id ? authorID = author.id : authorID = author
            if (personaIDs.some(id => id === authorID)) {
              ownReviews = ownReviews.concat([review])
            }
          })
        })

        // get a user's drafts
        let ownDrafts = ownReviews.length ? ownReviews.filter(review => !review.isPublished).map(review => review.drafts) : []

        const latestDraft = ownDrafts.length ? ownDrafts.sort((a, b) => b.id - a.id)[0] : []

        // get the latest draft content & seed to the text editor
        latestDraft.length ? setInitialContent(latestDraft[0].contents) : setInitialContent('')

        // gets all published reviews of the preprint
        let published = preprint.fullReviews.filter(review => review.isPublished)
        
        published.map(review => {
          review.authors.map(author => {
            let authorID;
            author.id ? authorID = author.id : authorID = author
            if (user.personas.some(persona => persona.id === authorID)) {
                setHasLongReviewed(true);
            } 
          });
        });
      }

      if (preprint.rapidReviews.length) {
        let authorID;
        preprint.rapidReviews.map(review => {
          review.author.id ? authorID = review.author.id : authorID = review.author
          setHasRapidReviewed(user.personas.some(persona => persona.id === authorID));
        });
      }

      if (preprint.requests.length) {
        let authorID;
        preprint.requests.map(request => {
          request.author.id ? authorID = request.author.id : authorID = request.author
          setHasRequested(user.personas.some(persona => persona.id === authorID));
        });
      }
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
                  Read Reviews
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
                  disabled={loadingPostReviewRequest}
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
      </div>
      {isLoginModalOpen && (
        <LoginRequiredModal
          next={process.env.IS_EXTENSION ? undefined : location.pathname}
          onClose={() => {
            setIsLoginModalOpen(false);
          }}
        />
      )}
      <div className="shell-content__body" style={{ paddingTop: height }}>
        {tab === 'read' ? (
          <ShellContentRead
            user={user}
            preprint={preprint}
            counts={counts}
            rapidContent={rapidContent}
            longContent={longContent}
            newRequest={newRequest}
            height={height}
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
            error={errorPostReviewRequest}
            hasRequested={hasRequested}
            newRequest={newRequest}
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
  height,
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
        height={height}
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
  height: PropTypes.number,
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
  isPosting,
  error,
  hasRequested,
  newRequest,
}) {
  const classes = useStyles();

  return (
    <div>
      {hasRequested || newRequest ? (
        <div className="shell-content-request">
          <Box mt={2} mb={2} className={classes.yellow}>
            Your request has been successfully posted.
          </Box>
        </div>
      ) : (
        <div className="shell-content-request">
          <header className="shell-content-request__title">
            Add a request for review
          </header>

          <Controls error={error}>
            <Button
              primary={true}
              isWaiting={isPosting}
              onClick={() => {
                onSubmit(preprint);
              }}
            >
              Submit
            </Button>
          </Controls>
        </div>
      )}
    </div>
  );
}
ShellContentRequest.propTypes = {
  preprint: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isPosting: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
  hasRequested: PropTypes.bool,
  newRequest: PropTypes.bool,
};
