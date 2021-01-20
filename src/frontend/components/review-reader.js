// base imports
import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';

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
  const [content, setContent] = useState('');
  const [commentTitle, setCommentTitle] = useState('');
  const [publishedTitle, setPublishedTitle] = useState('');
  const [publishedComment, setPublishedComment] = useState('');
  const [allRapidReviews, setAllRapidReviews] = useState(preprint.rapidReviews);
  const [publishedReviews, setPublishedReviews] = useState(
    preprint.fullReviews.filter(review => review.isPublished),
  );
  const [allReviews, setAllReviews] = useState(
    publishedReviews.concat(allRapidReviews),
  );

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
      {!preview && (
        <h3 className="review-reader__title">
          {!allRapidReviews.length &&
          !publishedReviews.length &&
          !preprint.requests.length ? null : allRapidReviews.length ? (
            <span>{` ${allRapidReviews.length} rapid review${
              allRapidReviews.length > 1 ? 's' : ''
            }`}</span>
          ) : (
            ''
          )}
          {publishedReviews.length ? (
            <span>{`${publishedReviews.length} full review${
              publishedReviews.length > 1 ? 's' : ''
            }`}</span>
          ) : (
            ''
          )}
          {preprint.requests.length || newRequest ? (
            <span>{`${
              newRequest
                ? preprint.requests.length + 1
                : preprint.requests.length
            } request${preprint.requests.length > 1 ? 's' : ''}`}</span>
          ) : (
            ''
          )}
        </h3>
      )}

      {allReviews.length ? (
        <Fragment>
          {!preview && (
            <Fragment>
              <h4 className="review-reader__sub-header">Reviewers</h4>
              <div className="review-reader__persona-selector">
                <PotentialRoles
                  role={role}
                  allReviews={allReviews}
                  hasReviewed={
                    rapidContent || (longContent && longContent.length)
                  }
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
            </Fragment>
          )}

          {allRapidReviews && allRapidReviews.length ? (
            <>
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
            </>
          ) : null}

          {publishedReviews && publishedReviews.length ? (
            <div className="text-answers">
              <div className="text-answers__question">Longform Reviews</div>
              {publishedReviews.map(review => {
                if (review.isPublished && review.drafts && review.drafts.length) {
                  return (
                    <div
                      key={review.id}
                      className="text-answers__long-response-row"
                    >
                      {review.drafts[review.drafts.length - 1].title ? (
                        <div className="text-answers__question long">
                          {review.drafts[review.drafts.length - 1].title}
                        </div>
                      ) : null}
                      <div>
                        {review.authors.map(author => (
                          <span key={author.id}>
                            <em>by {author.name}</em>
                          </span>
                        ))}
                      </div>
                      <div>
                        {ReactHtmlParser(
                          review.drafts[review.drafts.length - 1].contents,
                          options,
                        )}
                      </div>
                      {(review.comments || publishedComment) && (
                        <div className="comments">
                          <div>
                            <b>Comments</b>
                          </div>
                          {review.comments
                            ? review.comments.map(comment => {
                                return (
                                  <div key={comment.id}>
                                    {comment.title ? (
                                      <div className="comments-title">
                                        {comment.title}
                                      </div>
                                    ) : null}
                                    <div>
                                      <em>{comment.author.name}</em>
                                    </div>
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: `${comment.contents}`,
                                      }}
                                    />
                                  </div>
                                );
                              })
                            : null}
                          {publishedComment ? (
                            <div>
                              {commentTitle ? (
                                <div className="comments-title">
                                  {publishedTitle}
                                </div>
                              ) : null}
                              <div>
                                <em>{user.name}</em>
                              </div>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: `${publishedComment}`,
                                }}
                              />
                            </div>
                          ) : null}
                        </div>
                      )}
                      <form className="comments__add">
                        <div>
                          <b>Add a comment</b>
                        </div>
                        <input
                          className="comments-title-input"
                          type="text"
                          placeholder={'Title'}
                          value={commentTitle}
                          onChange={event =>
                            setCommentTitle(event.target.value)
                          }
                          required
                        />
                        <CommentEditor
                          initialContent={''}
                          handleContentChange={handleCommentChange}
                        />
                        <Controls error={errorPostComment}>
                          <Button
                            type="submit"
                            primary={true}
                            isWaiting={loadingPostComment}
                            disabled={!canSubmit(content)}
                            onClick={event => {
                              event.preventDefault();
                              if (canSubmit(content)) {
                                postComment({
                                  title: commentTitle,
                                  contents: content,
                                })
                                  .then(() => {
                                    alert('Comment submitted successfully.');
                                    return handleSubmitComment(
                                      commentTitle,
                                      content,
                                    );
                                  })
                                  .catch(err =>
                                    alert(`An error occurred: ${err.message}`),
                                  );
                              } else {
                                alert('Comment cannot be blank.');
                              }
                            }}
                          >
                            Save
                          </Button>
                        </Controls>
                      </form>
                    </div>
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
                      {console.log(user)}
                        <span key={user.id}>
                          by{' '}
                          {user.defaultPersona
                            ? user.defaultPersona.name
                            : user.name}
                        </span>
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
          ) : null}

          {preprint.tags && preprint.tags.length ? (
            <div className="tags">
              <div className="tags__title">Subject Tags</div>
              <div className="tags__content">
                {preprint.tags.map(tag => {
                  return (
                    <div key={tag.name} className="tags__tag">
                      {tag.name}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </Fragment>
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
