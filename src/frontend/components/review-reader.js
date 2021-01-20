// base imports
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';

// material UI
import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// utils
import { getYesNoStats } from '../utils/stats';

// hooks
import { usePostComments } from '../hooks/api-hooks.tsx';

// components
import Barplot from './barplot';
import Button from './button';
import CommentEditor from './comment-editor';
import Controls from './controls';
import { PotentialRoles } from './role-list';
import ShareMenu from './share-menu';
import TextAnswers from './text-answers';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  accordion: {
    borderLeft: '5px solid #EBE9E9',
    boxShadow: 'none',
  },
  h3: {
    fontSize: theme.typography.pxToRem(24),
    fontWeight: '600',
  },
  h4: {
    fontSize: theme.typography.pxToRem(16),
    fontWeight: '600',
  },
}));

const ReviewReader = React.memo(function ReviewReader({
  user,
  role,
  preview,
  preprint,
  defaultHighlightedRoleIds,
  onHighlighedRoleIdsChange = noop,
  isModerationInProgress,
  onModerate,
  rapidContent,
  longContent,
  newRequest,
}) {
  const classes = useStyles();

  const [content, setContent] = useState('');
  const [commentTitle, setCommentTitle] = useState('');
  const [publishedTitle, setPublishedTitle] = useState('');
  const [publishedComment, setPublishedComment] = useState('');
  const [allRapidReviews, setAllRapidReviews] = useState(preprint.rapidReviews);
  const [publishedReviews, setPublishedReviews] = useState(
    preprint.fullReviews.filter(review => review.isPublished),
  );
  const [allReviews] = useState(publishedReviews.concat(allRapidReviews));
  const [expandRapid, setExpandRapid] = React.useState(true);
  const [expandLong, setExpandLong] = React.useState(true);

  const handleChangeRapid = panel => (event, newExpanded) => {
    setExpandRapid(newExpanded ? panel : false);
  };

  const handleChangeLong = panel => (event, newExpanded) => {
    setExpandLong(newExpanded ? panel : false);
  };

  const {
    mutate: postComment,
    loadingPostComment,
    errorPostComment,
  } = usePostComments();

  const handleCommentChange = value => {
    setContent(value);
  };

  const handleSubmitComment = (title, content) => {
    setPublishedTitle(title);
    setPublishedComment(content);
    setCommentTitle('');
    setContent('');
  };

  const canSubmit = content => {
    return content && content !== '<p></p>';
  };

  const [highlightedRoleIds, setHighlightedRoleIds] = useState(
    defaultHighlightedRoleIds || [],
  );

  const transform = node => {
    if (node.attribs.class === 'ql-editor') {
      node.attribs.class = '';
      node.attribs.contenteditable = false;
    } else if (
      node.attribs.class === 'ql-clipboard' ||
      node.attribs.class === 'ql-tooltip ql-hidden'
    ) {
      return null;
    }
    return convertNodeToElement(node);
  };

  const options = {
    decodeEntities: true,
    transform,
  };

  useEffect(() => {
    if (
      rapidContent &&
      Object.keys(rapidContent).length !== 0 &&
      rapidContent.constructor === Object
    ) {
      const all = [...allRapidReviews, rapidContent];
      setAllRapidReviews(all);
      setAllReviews(allReviews => [...allReviews, rapidContent]);
    }

    if (longContent) {
      const all = [...publishedReviews, longContent];
      setPublishedReviews(all);
      setAllReviews(allReviews => [...allReviews, longContent]);
    }
  }, [
    rapidContent,
    longContent,
    publishedTitle,
    publishedComment,
    content,
    commentTitle,
  ]);

  useEffect(() => {
    if (
      defaultHighlightedRoleIds &&
      !isEqual(defaultHighlightedRoleIds, highlightedRoleIds)
    ) {
      setHighlightedRoleIds(defaultHighlightedRoleIds);
    }
  }, [defaultHighlightedRoleIds, highlightedRoleIds]);

  useEffect(() => {}, [
    allReviews,
    allRapidReviews,
    publishedReviews,
    newRequest,
  ]);

  return (
    <div
      className={classNames('review-reader', {
        'review-reader--full': !preview,
        'review-reader--preview': preview,
      })}
    >
      {allReviews.length ? (
        <div className={classes.root}>
          <Accordion
            className={classes.accordion}
            expanded={expandRapid}
            onChange={handleChangeRapid(!expandRapid)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="rapid-reviews-content"
              id="rapid-reviews-header"
            >
              <Typography variant="h3" className={classes.h3}>
                Rapid Reviews
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {allRapidReviews && allRapidReviews.length ? (
                <div>
                  <Typography variant="h4" className={classes.h4} gutterBottom>
                    Reviewers
                  </Typography>
                  <div className="review-reader__persona-selector">
                    <PotentialRoles
                      role={role}
                      allReviews={allRapidReviews}
                      hasReviewed={rapidContent}
                      user={user}
                      isModerationInProgress={isModerationInProgress}
                      onModerate={onModerate}
                      onRemoved={roleId => {
                        const nextHighlightedRoleIds = highlightedRoleIds.concat(
                          roleId,
                        );
                        onHighlighedRoleIdsChange(nextHighlightedRoleIds);
                        setHighlightedRoleIds(nextHighlightedRoleIds);
                      }}
                    />
                  </div>
                  <Barplot
                    stats={getYesNoStats(allRapidReviews)}
                    nReviews={allRapidReviews.length}
                  >
                    <ShareMenu
                      identifier={preprint.handle}
                      roleIds={highlightedRoleIds}
                    />
                  </Barplot>

                  <TextAnswers
                    user={user}
                    role={role}
                    reviews={allRapidReviews}
                    isModerationInProgress={isModerationInProgress}
                    onModerate={onModerate}
                  />
                </div>
              ) : (
                <div>No rapid reviews yet.</div>
              )}
            </AccordionDetails>
          </Accordion>
          <Accordion
            className={classes.accordion}
            expanded={expandLong}
            onChange={handleChangeLong(!expandLong)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-header"
            >
              <Typography variant="h3" className={classes.h3}>
                Longform Reviews
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {publishedReviews && publishedReviews.length ? (
                <div>
                  <Typography variant="h4" className={classes.h4} gutterBottom>
                    Reviewers
                  </Typography>
                  <div className="review-reader__persona-selector">
                    <PotentialRoles
                      role={role}
                      allReviews={publishedReviews}
                      hasReviewed={longContent && longContent.length}
                      user={user}
                      isModerationInProgress={isModerationInProgress}
                      onModerate={onModerate}
                      onRemoved={roleId => {
                        const nextHighlightedRoleIds = highlightedRoleIds.concat(
                          roleId,
                        );
                        onHighlighedRoleIdsChange(nextHighlightedRoleIds);
                        setHighlightedRoleIds(nextHighlightedRoleIds);
                      }}
                    />
                  </div>
                  <div className="text-answers">
                    {publishedReviews.map(review => {
                      if (
                        review.isPublished &&
                        review.drafts &&
                        review.drafts.length
                      ) {
                        const reviewContent =
                          review.drafts[review.drafts.length - 1];
                        return (
                          <Accordion>
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls={`review-content-${review.id}`}
                              id={`review-header-${review.id}`}
                            >
                              <Typography className={classes.h4}>
                                {review.authors.length >= 2 ? (
                                  review.authors.slice(0, 2).map(author => (
                                    <span
                                      key={author.id}
                                      className="review-reader__header-author"
                                    >
                                      {author.defaultPersona
                                        ? author.defaultPersona.name
                                        : author.name}
                                    </span>
                                  ))
                                ) : (
                                  <span
                                    key={review.authors[0].id}
                                    className="review-reader__header-author"
                                  >
                                    {review.authors[0].defaultPersona
                                      ? review.authors[0].defaultPersona.name
                                      : review.authors[0].name}
                                  </span>
                                )}
                                {review.authors.length > 2 ? '...' : null}
                              </Typography>
                              <Typography className={classes.h4}>
                                {reviewContent.title}
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Typography>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                                sit amet blandit leo lobortis eget.
                              </Typography>
                            </AccordionDetails>
                          </Accordion>
                        );
                      }
                      if (typeof review === 'string') {
                        return (
                          <div
                            key={'new-review'}
                            className="text-answers__long-response-row"
                          >
                            <div className="text-answers__question long">
                              {'New user review'}
                            </div>
                            <div className="">
                              <span key={user.id}>by {user.name}</span>
                            </div>
                            <div
                              className=""
                              dangerouslySetInnerHTML={{
                                __html: `${review}`,
                              }}
                            />
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              ) : (
                <div>No longform reviews to display.</div>
              )}
            </AccordionDetails>
          </Accordion>
        </div>
      ) : (
        <div className="text-answers">
          <div className="text-answers__question long">
            No reviews yet. Would you like to leave one?
          </div>
        </div>
      )}
    </div>
  );
});

ReviewReader.propTypes = {
  user: PropTypes.object,
  role: PropTypes.object,
  preview: PropTypes.bool,
  preprint: PropTypes.object, // DOI or arXivID
  onHighlighedRoleIdsChange: PropTypes.func,
  defaultHighlightedRoleIds: PropTypes.arrayOf(PropTypes.string),
  isModerationInProgress: PropTypes.bool,
  onModerate: PropTypes.func,
  rapidContent: PropTypes.object,
  longContent: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  newRequest: PropTypes.bool,
};

export default ReviewReader;
