// base imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

// hooks
import { usePostRequests } from '../hooks/api-hooks.tsx';

// utils
import { createPreprintId } from '../../common/utils/ids.js';

// Material UI imports
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

// components
import Controls from './controls';
import HeaderBarReviews from './header-bar-reviews';
import LoginRequiredModal from './login-required-modal';
import PreprintPreview from './preprint-preview';
import Reviewers from './role-list';
import ReviewReader from './review-reader';
import ReviewStepper from './review-stepper';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reviews-requests-tab-panel-${index}`}
      aria-labelledby={`reviews-requests-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `reviews-requests-tab-${index}`,
    'aria-controls': `reviews-requests-tab-panel-${index}`,
  };
}

const useStyles = makeStyles(theme => ({
  appBar: {
    backgroundColor: '#fff',
    color: '#000',
  },
  headerBar: {
    position: 'absolute',
    top: 0,
    width: '80%',
    [theme.breakpoints.up('sm')]: {
      width: '36vw',
    },
  },
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  yellow: {
    backgroundColor: '#FFFAEE',
    padding: 10,
  },
}));

export default function ShellContent({ preprint, user, cid }) {
  const classes = useStyles();
  const location = useLocation();

  const [hasRapidReviewed, setHasRapidReviewed] = useState(false);
  const [hasLongReviewed, setHasLongReviewed] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [newRequest, setNewRequest] = useState(false);
  const [review, setReview] = useState(null);
  const [tab, setTab] = useState(0);

  const {
    mutate: postReviewRequest,
    loadingPostReviewRequest,
    errorPostReviewRequest,
  } = usePostRequests({ pid: preprint.uuid });

  const counts =
    preprint.requests.length +
    preprint.rapidReviews.length +
    preprint.fullReviews.length;

  const [rapidContent, setRapidContent] = useState(null);

  const onCloseReviews = (rapidReview, longReview) => {
    if (rapidReview) {
      setHasRapidReviewed(true);
      setRapidContent(rapidReview);
    }

    if (longReview) {
      setLongContent(longReview);
      setHasLongReviewed(true);
    }
  };

  const [longContent, setLongContent] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [open, setOpen] = useState(null);

  const onContentChange = value => {
    setInitialContent(value);
  };

  const onCloseRequest = () => {
    setNewRequest(true);
    setTab(0);
  };

  const onReviewChange = review => {
    setReview(review);
  };

  const handleChange = (event, newValue) => {
    if (!user && newValue !== 0) {
      setOpen(true);
    }
    setTab(newValue);
  };

  useEffect(() => {
    if (location.state && location.state.tab) {
      setTab(location.state.tab);
    }

    if (user) {
      if (!hasLongReviewed && preprint.fullReviews.length) {
        // gets an array of the active user's persona IDs
        let personaIDs = user.personas.map(persona => persona.uuid);

        // collects the user's reviews for the current preprint, whether published or not
        let ownReviews = [];
        preprint.fullReviews.map(review => {
          review.authors.map(author => {
            let authorID;
            author.uuid ? (authorID = author.uuid) : (authorID = author);
            if (personaIDs.some(id => id === authorID)) {
              ownReviews = ownReviews.concat([review]);
            }
          });
        });

        // get a user's drafts of the correct review if cid is present, or latest if not
        let ownDrafts,
          latestDraft = [];
        if (cid) {
          ownDrafts = ownReviews.length
            ? ownReviews.find(
                review => review.uuid === cid && !review.isPublished,
              )
            : [];

          latestDraft =
            ownDrafts && ownDrafts.drafts && ownDrafts.drafts.length
              ? ownDrafts.drafts.length > 1
                ? ownDrafts.drafts.sort(
                    (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
                  )[ownDrafts.drafts.length - 1]
                : ownDrafts.drafts[0]
              : null;

          // get the latest draft content & seed to the text editor
          if (latestDraft) {
            latestDraft.authors = ownDrafts.authors;
            setInitialContent(latestDraft.contents);
            setReview(latestDraft);
          }
        } else {
          ownDrafts = ownReviews.length
            ? ownReviews
                .filter(review => !review.isPublished)
                .map(review => review.drafts)
            : [];

          latestDraft = ownDrafts.length
            ? ownDrafts.sort(
                (a, b) => new Date(a[0].updatedAt) - new Date(b[0].updatedAt),
              )[ownDrafts.length - 1]
            : [];

          latestDraft = latestDraft.length
            ? latestDraft[latestDraft.length - 1]
            : null;

          // get the latest draft content & seed to the text editor
          if (latestDraft) {
            latestDraft.authors = ownDrafts.authors;
            setInitialContent(latestDraft.contents);
            setReview(latestDraft);
          }
        }

        // gets all published reviews of the preprint
        let published = preprint.fullReviews.filter(
          review => review.isPublished,
        );

        published.map(review => {
          review.authors.map(author => {
            let authorID;
            author.uuid ? (authorID = author.uuid) : (authorID = author);
            if (user.personas.some(persona => persona.uuid === authorID)) {
              setHasLongReviewed(true);
            }
          });
        });
      }

      if (!hasRapidReviewed && preprint.rapidReviews.length) {
        let authorID;
        preprint.rapidReviews.map(review => {
          review.author.uuid
            ? (authorID = review.author.uuid)
            : (authorID = review.author);
          if (user.defaultPersona.uuid === authorID) {
            setHasRapidReviewed(user.defaultPersona.uuid === authorID);
          }
        });
      }

      if (!hasRequested && preprint.requests.length) {
        let authorID;
        preprint.requests.map(request => {
          request.author.uuid
            ? (authorID = request.author.uuid)
            : (authorID = request.author);
          setHasRequested(
            user.personas.some(persona => persona.uuid === authorID),
          );
        });
      }
    } else {
      setOpen(`/preprints/${createPreprintId(preprint.handle)}`);
    }
  }, [
    open,
    preprint,
    user,
    rapidContent,
    longContent,
    hasRequested,
    hasRapidReviewed,
    hasLongReviewed,
  ]);

  return (
    <>
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
      <div className={classes.root}>
        <Box className={classes.headerBar}>
          <HeaderBarReviews thisUser={user} />
        </Box>
        <PreprintPreview preprint={preprint} />
        <AppBar position="static" className={classes.appBar}>
          <Tabs
            value={tab}
            onChange={handleChange}
            aria-label="Reviews and requests"
          >
            <Tab label="Read PREreviews" {...a11yProps(0)} />
            <Tab label="Add PREreview(s)" {...a11yProps(1)} />
            <Tab label="Add Request" {...a11yProps(2)} />
          </Tabs>
        </AppBar>
        <TabPanel value={tab} index={0}>
          <ShellContentRead
            user={user}
            preprint={preprint}
            counts={counts}
            rapidContent={rapidContent}
            longContent={longContent}
            newRequest={newRequest}
          />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          {user ? (
            <ShellContentReviews
              cid={cid}
              review={review}
              user={user}
              preprint={preprint}
              onClose={onCloseReviews}
              onContentChange={onContentChange}
              onReviewChange={onReviewChange}
              hasRapidReviewed={hasRapidReviewed}
              hasLongReviewed={hasLongReviewed}
              initialContent={initialContent}
            />
          ) : (
            <LoginRequiredModal
              open={open}
              onClose={() => {
                setOpen(null);
                setTab(0);
              }}
            />
          )}
        </TabPanel>
        <TabPanel value={tab} index={2}>
          {user ? (
            <ShellContentRequest
              user={user}
              preprint={preprint}
              onSubmit={preprint => {
                postReviewRequest({ preprint: preprint.uuid })
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
          ) : (
            <LoginRequiredModal
              open={open}
              onClose={() => {
                setOpen(null);
                setTab(0);
              }}
            />
          )}
        </TabPanel>
      </div>
    </>
  );
}

ShellContent.propTypes = {
  preprint: PropTypes.object.isRequired,
  user: PropTypes.object,
  cid: PropTypes.string,
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
    <>
      <ReviewReader
        user={user}
        preprint={preprint}
        nRequests={counts}
        rapidContent={rapidContent}
        longContent={longContent}
        newRequest={newRequest}
      />
      {/*
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
      */}
    </>
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
  cid,
  review,
  onReviewChange,
}) {
  return cid ? (
    review ? (
      <ReviewStepper
        preprint={preprint}
        disabled={disabled}
        onClose={onClose}
        onContentChange={onContentChange}
        hasRapidReviewed={hasRapidReviewed}
        hasLongReviewed={hasLongReviewed}
        content={initialContent}
        review={review}
        onReviewChange={onReviewChange}
      />
    ) : (
      <Typography component="div" variant="body2">
        Sorry, you are not authorized to contribute to this PREreview.
      </Typography>
    )
  ) : (
    <ReviewStepper
      preprint={preprint}
      disabled={disabled}
      onClose={onClose}
      onContentChange={onContentChange}
      hasRapidReviewed={hasRapidReviewed}
      hasLongReviewed={hasLongReviewed}
      content={initialContent}
      review={review}
      onReviewChange={onReviewChange}
    />
  );
}
ShellContentReviews.propTypes = {
  preprint: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onContentChange: PropTypes.func.isRequired,
  onReviewChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  hasLongReviewed: PropTypes.bool.isRequired,
  hasRapidReviewed: PropTypes.bool.isRequired,
  initialContent: PropTypes.string,
  cid: PropTypes.string,
  review: PropTypes.object,
};

function ShellContentRequest({
  preprint,
  onSubmit,
  isPosting,
  error,
  hasRequested,
  newRequest,
  user,
}) {
  const classes = useStyles();

  return (
    <div>
      <Typography variant="h4" component="h4" gutterBottom>
        Requesters
      </Typography>
      <Reviewers
        preprintId={preprint.uuid}
        allReviews={preprint.requests}
        user={user}
        hasReviewed={newRequest}
        hasRequested
      />
      {hasRequested || newRequest ? (
        <Box mt={2} mb={2} className={classes.yellow}>
          <Typography component="div" variant="body2">
            Your request has been successfully posted.
          </Typography>
        </Box>
      ) : (
        <Box>
          <Controls error={error}>
            <Button
              color="primary"
              primary="true"
              variant="contained"
              isWaiting={isPosting}
              onClick={() => {
                onSubmit(preprint);
              }}
            >
              Add a request for PREreview
            </Button>
          </Controls>
        </Box>
      )}
    </div>
  );
}
ShellContentRequest.propTypes = {
  preprint: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isPosting: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
  hasRequested: PropTypes.bool,
  newRequest: PropTypes.bool,
};
