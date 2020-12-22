import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import Barplot from './barplot';
import { getId } from '../utils/jsonld';
import { getYesNoStats } from '../utils/stats';
import TextAnswers from './text-answers';
import { PotentialRoles } from './role-list';
import ShareMenu from './share-menu';

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
  const [highlightedRoleIds, setHighlightedRoleIds] = useState(
    defaultHighlightedRoleIds || [],
  );

  let allReviews = preprint.fullReviews.concat(preprint.rapidReviews);

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
          {preprint.rapidReviews.length > 0 ? preprint.rapidReviews.length : 0} rapid review{preprint.rapidReviews.length > 1 ? 's' : ''}
          {preprint.fullReviews.length > 0
            ? ` | ${preprint.fullReviews.length} full review${
                preprint.fullReviews.length > 1 ? 's' : ''
              }`
            : ''}
          {preprint.requests.length > 0
            ? ` | ${preprint.requests.length} request${
                preprint.requests.length > 1 ? 's' : ''
              }`
            : ''}
        </h3>
      )}

      {(preprint.rapidReviews.length || preprint.fullReviews.length) && (
        <Fragment>
          {!preview && (
            <Fragment>
              <h4 className="review-reader__sub-header">Reviewers</h4>
              <div className="review-reader__persona-selector">
                <PotentialRoles
                  role={role}
                  reviews={allReviews}
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
            stats={getYesNoStats(highlightedActions)}
            nTotalReviews={preprint.rapidReviews.length}
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
              actions={highlightedActions}
              isModerationInProgress={isModerationInProgress}
              onModerate={onModerate}
            />
          )}

          {preprint.fullReviews.length && (
            <div className="text-answers">
              {preprint.fullReviews.map(review => {
                if (review.published) {
                  return (
                    <div>
                      <div className="text-answers__question">
                        {review.drafts[review.drafts.length - 1].title}
                      </div>
                      <div className="text-answers__response-row">
                        {review.authors.map(author => (
                          <span key={author.id}>by {author.name}</span>
                        ))}
                      </div>
                      <div className="text-answers__response-row">
                        {review.drafts[review.drafts.length - 1].contents}
                      </div>
                      {review.comments && (
                        <div>
                          <div>Comments</div>
                          {review.comments.map(comment => {
                            return <div key={comment.id}>{comment.contents}</div>
                          })}
                        </div>
                      )}
                    </div>
                  )
                }
              })}
            </div>
          )}

          {preprint.tags && (
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
