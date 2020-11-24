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
  nRequests,
  defaultHighlightedRoleIds,
  onHighlighedRoleIdsChange = noop,
  isModerationInProgress,
  onModerate,
}) {
  const [highlightedRoleIds, setHighlightedRoleIds] = useState(
    defaultHighlightedRoleIds || [],
  );

  useEffect(() => {
    if (
      defaultHighlightedRoleIds &&
      !isEqual(defaultHighlightedRoleIds, highlightedRoleIds)
    ) {
      setHighlightedRoleIds(defaultHighlightedRoleIds);
    }
  }, [defaultHighlightedRoleIds, highlightedRoleIds]);

  const roleIds = useMemo(() => {
    return preprint.reviews
      ? preprint.reviews
          .map(review => useGetUser(review.author))
          .filter(
            roleId =>
              !highlightedRoleIds.some(
                highlightedRoleId => roleId === highlightedRoleId,
              ),
          )
      : {};
  }, [preprint.reviews, highlightedRoleIds]);

  const highlightedActions = useMemo(() => {
    return highlightedRoleIds.length
      ? preprint.reviews.filter(action =>
          highlightedRoleIds.some(roleId => getId(action.agent) === roleId),
        )
      : preprint.reviews;
  }, [preprint.reviews, highlightedRoleIds]);

  return (
    <div
      className={classNames('review-reader', {
        'review-reader--full': !preview,
        'review-reader--preview': preview,
      })}
    >
      {!preview && (
        <h3 className="review-reader__title">
          {preprint.reviews ? preprint.reviews.length : 0} review{preprint.reviews && preprint.reviews.length > 1 ? 's' : ''}
          {nRequests != null
            ? ` | ${nRequests} request${nRequests !== 1 ? 's' : ''}`
            : ''}
        </h3>
      )}

      {preprint.reviews && (
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
                  actions={preprint.reviews}
                  canModerate={!!user}
                  isModerationInProgress={isModerationInProgress}
                  onModerate={onModerate}
                  roleIds={roleIds}
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
                  actions={preprint.reviews}
                  canModerate={!!user}
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
            nHighlightedReviews={highlightedRoleIds.length || actions.length}
            nTotalReviews={preprint.reviews.length}
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
  preprint: PropTypes.object.isRequired, // DOI or arXivID
  onHighlighedRoleIdsChange: PropTypes.func,
  nRequests: PropTypes.number,
  defaultHighlightedRoleIds: PropTypes.arrayOf(PropTypes.string),
  isModerationInProgress: PropTypes.bool,
  onModerate: PropTypes.func,
};

export default ReviewReader;
