import React, { useState, useEffect, useMemo, Fragment } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import { useGetUser } from '../hooks/api-hooks.tsx';
import Barplot from './barplot';
import { getId } from '../utils/jsonld';
import { getYesNoStats } from '../utils/stats';
import TextAnswers from './text-answers';
import { PotentialRoles, HighlightedRoles } from './role-list';
import ShareMenu from './share-menu';
import NoticeBox from './notice-box';

const ReviewReader = React.memo(function ReviewReader({
  user,
  role,
  preview,
  preprint,
  defaultHighlightedRoleIds,
  onHighlighedRoleIdsChange = noop,
  isModerationInProgress,
  onModerate,
}) {
  const [highlightedRoleIds, setHighlightedRoleIds] = useState(
    defaultHighlightedRoleIds || [],
  );

  const allReviews = preprint.fullReviews.concat(preprint.rapidReviews);

  useEffect(() => {
    if (
      defaultHighlightedRoleIds &&
      !isEqual(defaultHighlightedRoleIds, highlightedRoleIds)
    ) {
      setHighlightedRoleIds(defaultHighlightedRoleIds);
    }
  }, [defaultHighlightedRoleIds, highlightedRoleIds]);

  const roleIds = allReviews.length
    ? allReviews
        .map(review => (review.author ? useGetUser(review.author) : null))
        .filter(
          roleId =>
            !highlightedRoleIds.some(
              highlightedRoleId => roleId === highlightedRoleId,
            ),
        )
    : {};

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
              <NoticeBox>
                View only the reviews you are interested in by
                dragging-and-dropping user badges to the filter bubble below.
              </NoticeBox>

              <h4 className="review-reader__sub-header">Reviewers</h4>
              <div className="review-reader__persona-selector">
                <PotentialRoles
                  role={role}
                  reviews={allReviews}
                  canModerate={user}
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

                <h4 className="review-reader__sub-header">Reviewers Filter</h4>

                <HighlightedRoles
                  role={role}
                  reviews={allReviews}
                  canModerate={user}
                  isModerationInProgress={isModerationInProgress}
                  onModerate={onModerate}
                  roleIds={highlightedRoleIds}
                  onRemoved={ids => {
                    const nextHighlightedRoleIds = highlightedRoleIds.filter(
                      roleId => !ids.some(id => roleId === id),
                    );
                    onHighlighedRoleIdsChange(nextHighlightedRoleIds);
                    setHighlightedRoleIds(nextHighlightedRoleIds);
                  }}
                />
              </div>
            </Fragment>
          )}

          <Barplot
            preview={preview}
            stats={getYesNoStats(highlightedActions)}
            nHighlightedReviews={
              highlightedRoleIds.length || preprint.rapidReviews.length
            }
            nTotalReviews={
              preprint.rapidReviews.length + preprint.fullReviews.length
            }
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
};

export default ReviewReader;
