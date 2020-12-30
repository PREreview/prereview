import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import Barplot from './barplot';
import Controls from './controls';
import Button from './button';
import { getId } from '../utils/jsonld';
import { getYesNoStats } from '../utils/stats';
import TextAnswers from './text-answers';
import { PotentialRoles } from './role-list';
import ShareMenu from './share-menu';
import CollabEditor from './collab-editor';
import { usePostComments } from '../hooks/api-hooks.tsx';

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
}) {
  const [content, setContent] = useState('');
  const [commentTitle, setCommentTitle] = useState('');

  const {
    mutate: postComment,
    loadingPostComment,
    errorPostComment,
  } = usePostComments();

  const handleCommentChange = value => {
    setContent(value);
  };

  const canSubmit = content => {
    return content && content !== '<p></p>';
  };

  const [highlightedRoleIds, setHighlightedRoleIds] = useState(
    defaultHighlightedRoleIds || [],
  );

  const publishedReviews = preprint.fullReviews.filter(
    review => review.published,
  );

  let allReviews = publishedReviews.concat(preprint.rapidReviews);

  useEffect(() => {
    if (
      defaultHighlightedRoleIds &&
      !isEqual(defaultHighlightedRoleIds, highlightedRoleIds)
    ) {
      setHighlightedRoleIds(defaultHighlightedRoleIds);
    }
  }, [defaultHighlightedRoleIds, highlightedRoleIds]);

  const highlightedActions = highlightedRoleIds.length
    ? allReviews.filter(action =>
        highlightedRoleIds.some(roleId => getId(action.agent) === roleId),
      )
    : allReviews;

  return (
    <div
      className={classNames('review-reader', {
        'review-reader--full': !preview,
        'review-reader--preview': preview,
      })}
    >
      {!preview && (
        <h3 className="review-reader__title">
          {preprint.rapidReviews.length ? preprint.rapidReviews.length : 0} rapid review{preprint.rapidReviews.length > 1 ? 's' : ''}
          {publishedReviews.length
            ? ` | ${publishedReviews.length} full review${
                publishedReviews.length > 1 ? 's' : ''
              }`
            : ''}
          {preprint.requests.length
            ? ` | ${preprint.requests.length} request${
                preprint.requests.length > 1 ? 's' : ''
              }`
            : ''}
        </h3>
      )}

      {allReviews.length && (
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

          <Barplot
            stats={getYesNoStats(preprint.rapidReviews)}
            nReviews={preprint.rapidReviews.length}
          >
            <ShareMenu
              identifier={preprint.handle}
              roleIds={highlightedRoleIds}
            />
          </Barplot>

          {!preview && (
            <TextAnswers
              user={user}
              role={role}
              reviews={preprint.rapidReviews}
              isModerationInProgress={isModerationInProgress}
              onModerate={onModerate}
            />
          )}

          {publishedReviews && publishedReviews.length && (
            <div className="text-answers">
              <div className="text-answers__question">Longform Reviews</div>
              {publishedReviews.map(review => {
                if (review.published && review.drafts) {
                  return (
                    <div
                      key={review.id}
                      className="text-answers__long-response-row"
                    >
                      <div className="text-answers__question long">
                        {review.drafts[review.drafts.length - 1].title}
                      </div>
                      <div className="">
                        {review.authors.map(author => (
                          <span key={author.id}>by {author.name}</span>
                        ))}
                      </div>
                      <div
                        className=""
                        dangerouslySetInnerHTML={{
                          __html: `${
                            review.drafts[review.drafts.length - 1].contents
                          }`,
                        }}
                      />
                      {review.comments && (
                        <div>
                          <div>Comments</div>
                          {review.comments.map(comment => {
                            return (
                              <div key={comment.id}>{comment.contents}</div>
                            );
                          })}
                        </div>
                      )}
                      <form>
                        <div>Add a comment</div>
                        <input
                          type="text"
                          value={commentTitle}
                          onChange={event =>
                            setCommentTitle(event.target.value)
                          }
                          required
                        />
                        <div className="remirror-container">
                          <CollabEditor
                            initialContent={''}
                            handleContentChange={handleCommentChange}
                          />
                        </div>
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
                                  .then(() =>
                                    alert('Comment submitted successfully.'),
                                  )
                                  .catch(err =>
                                    alert(`An error occurred: ${err.message}`),
                                  );
                              } else {
                                alert('Review cannot be blank.');
                              }
                            }}
                          >
                            Save
                          </Button>
                        </Controls>
                      </form>
                    </div>
                  )
                }
              })}
            </div>
          )}

          {preprint.tags && preprint.tags.length && (
            <div>
              <div className="tags__title">Subject Tags</div>
              <div className="tags">
                {preprint.tags.map(tag => {
                  return (
                    <div key={tag.name} className="tags__tag">
                      {tag.name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Fragment>
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
  rapidContent: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  longContent: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
};

export default ReviewReader;
