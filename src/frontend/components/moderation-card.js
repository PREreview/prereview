// base imports
import React, { Fragment, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { format } from 'date-fns';

// utils
import { getId, unprefix } from '../utils/jsonld';
import { getTextAnswers, getActiveReports } from '../utils/stats';

// hooks
import {
  useDeleteRapidReview,
  useDeleteFullReview,
} from '../hooks/api-hooks.tsx';

// components
import Button from './button';
import Collapse from './collapse';
import Controls from './controls';
import IconButton from './icon-button';
import Modal from './modal';
import PreprintPreview from './preprint-preview';
import RoleBadge from './role-badge';
import Value from './value';

// materialUI components
import CircularProgress from '@material-ui/core/CircularProgress';

// icons
import { MdExpandLess, MdExpandMore, MdLock } from 'react-icons/md';

export default function ModerationCard({
  reviewer,
  review,
  isOpened,
  isLockedBy,
  onOpen,
  onClose,
  onSuccess,
}) {
  const [modalFrame, setModalFrame] = useState(null);
  // const locker = useGetUser(isLockedBy);
  const locker = reviewer; // FIXME

  const reports = review.isFlagged;
  const [content, setContent] = useState(null);

  useEffect(() => {
    const latestDraft = review && review.drafts && review.drafts.length
        ? review.drafts.length > 1
          ? review.drafts.sort((a, b) => a.id - b.id)[review.drafts.length - 1]
          : review.drafts[0]
        : null;

    if (latestDraft) {
      setContent(latestDraft.contents);
    }
  });

  return (
    <div
      className={classNames('moderation-card', {
        'moderation-card--locked': !!isLockedBy,
      })}
    >
      {/* The card body */}
      <div className="moderation-card__header">
        <div className="moderation-card__header__left">
          {review.authors.length ? (
            <>
              {/*review.authors.map(author => (
                <RoleBadge
                  key={author.uuid}
                  roleId={author}
                  className="moderation-card__header-badge"
                />
              ))*/}
            </>
          ) : null}
          <span className="moderation-card__header-name">
            {reviewer && (reviewer.name || reviewer.orcid)}
          </span>
        </div>
        <div className="moderation-card__header__right">
          Reviewed on{' '}
          <span>{format(new Date(review.updatedAt), 'MMM. d, yyyy')}</span>
        </div>
      </div>

      <div className="moderation-card__text-answers">
        <dl className="moderation-card__text-answers-list">
          <div className="moderation-card__text-answer">
            <dt className="moderation-card__text-answer-question">
              <Value>Content</Value>
            </dt>
            <dd className="moderation-card__text-answer-response">
              <Value>{content}</Value>
            </dd>
          </div>
        </dl>
      </div>

      {/* Expansion panel preview row */}
      <div className="moderation-card__expansion-preview">
        <div className="moderation-card__expansion-preview__left">
          <span className="moderation-card__expansion-preview-count">
            {reports.length} Report{reports.length > 1 ? 's' : ''}
          </span>
          {` `}
          <Value
            tagName="span"
            className="moderation-card__expansion-preview-title"
          >
            {review.title}
          </Value>
        </div>

        <IconButton
          className="preprint-card__expansion-toggle"
          onClick={() => {
            if (isOpened) {
              onClose();
            } else {
              onOpen();
            }
          }}
        >
          {isOpened ? <MdExpandLess /> : <MdExpandMore />}
        </IconButton>
      </div>

      <Collapse isOpened={isOpened}>
        <div className="moderation-card__expansion-content">
          {/* The moderation reason of each reporter */}
          <PreprintPreview preprint={review.preprint} hyperlinkTitle={true} />

          <h3 className="moderation-card__sub-title">User Reports</h3>

          <ul className="moderation-card__flag-reasons-list">
            {/*reports.map(report => (
              <li
                key={`${getId(report.agent)}-${report.startTime}`}
                className="moderation-card__flag-reasons-list-item"
              >
                <RoleBadge roleId={getId(report.agent)} />
                <Value className="moderation-card__flag-reason">
                  {report.moderationReason || 'No reason specified'}
                </Value>
              </li>
            ))*/}
          </ul>

          <Controls className="moderation-card__expansion-controls">
            {reviewer && !reviewer.isAdmin && (
              // FIXME should be reviewer.isModerated ?
              <Button
                primary={true}
                onClick={() => {
                  setModalFrame('ModerateRoleAction');
                }}
              >
                Block user
              </Button>
            )}
            <Button
              primary={true}
              onClick={() => {
                setModalFrame('ModerateRapidPREreviewAction');
              }}
            >
              Retract review
            </Button>
            <Button
              primary={true}
              onClick={() => {
                setModalFrame('IgnoreReportRapidPREreviewAction');
              }}
            >
              Ignore report
            </Button>

            {modalFrame && (
              <ModerationCardModal
                defaultFrame={modalFrame}
                user={reviewer}
                reviewAction={review}
                onClose={() => {
                  setModalFrame(null);
                }}
                onSuccess={onSuccess}
              />
            )}
          </Controls>
        </div>
      </Collapse>
      {!!locker && (
        <div className="moderation-card__lock-overlay">
          <div className="moderation-card__lock-overal__content">
            <div className="moderation-card__lock-overlay__lock-icon-container">
              <MdLock className="moderation-card__lock-overlay__lock-icon" />
            </div>
            <span className="moderation-card__lock-overlay__message">
              This report is currently being reviewed by another moderator.
            </span>

            <span className="moderation-card__lock-overlay__agent">
              {/*<RoleBadge roleId={locker} />*/}
              <span className="moderation-card__lock-overlay__agent-name">
                {locker ? locker.name || unprefix(getId(locker)) : null}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

ModerationCard.propTypes = {
  reviewer: PropTypes.object.isRequired,
  review: PropTypes.object.isRequired,
  isLockedBy: PropTypes.string, // the roleId of a moderator currently viewing the card
  isOpened: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

function ModerationCardModal({
  onClose,
  onSuccess,
  reviewAction,
  user,
  defaultFrame,
}) {
  const [frame] = useState(defaultFrame);
  const deleteRapidReview = useDeleteRapidReview();
  const deleteFullReview = useDeleteFullReview();
  const ref = useRef();

  return (
    <Modal title="Retract review">
      <div className="moderation-card-modal">
        {frame === 'ModerateRapidPREreviewAction' ? (
          <Fragment>
            <p>
              Retracting the review will prevent reader to see its content or
              existence.
            </p>

            <label htmlFor="retraction-reason">Retraction Reason</label>

            <textarea
              ref={ref}
              id="retraction-reason"
              name="moderationReason"
              rows="4"
            />

            <Controls
              error={deletePrereview.error} // #FIXME
            >
              <Button
                disabled={deletePrereview.loading}
                onClick={() => {
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={deletePrereview.loading}
                isWaiting={deletePrereview.loading}
                onClick={() => {
                  deletePrereview(user, reviewAction)
                    .then(() => alert('PREreview successfully deleted.'))
                    .catch(err => {
                      alert(`An error occurred: ${err}`);
                    });
                }}
              >
                Confirm
              </Button>
            </Controls>
          </Fragment>
        ) : frame === 'ModerateRoleAction' ? (
          <Fragment>
            <p>
              Blocking the user will prevent the persona used for this review to
              post further content.
            </p>

            <label htmlFor="retraction-reason">Blocking Reason</label>

            <textarea
              ref={ref}
              id="retraction-reason"
              name="moderationReason"
              rows="4"
            />

            <Controls
              error={deletePrereview.error} // #FIXME
            >
              <Button
                disabled={deletePrereview.loading}
                onClick={() => {
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={deletePrereview.loading}
                isWaiting={deletePrereview.loading}
                onClick={() => {
                  deletePrereview(user, reviewAction)
                    .then(() => alert('PREreview successfully deleted.'))
                    .catch(err => {
                      alert(`An error occurred: ${err}`);
                    });
                }}
              >
                Confirm
              </Button>
            </Controls>
          </Fragment>
        ) : frame === 'IgnoreReportRapidPREreviewAction' ? (
          <Fragment>
            <p>
              Ignoring the user reports will remove the review from the
              moderation page and ensure that the review remains displayed going
              forward.
            </p>

            <label htmlFor="retraction-reason">Reason</label>

            <textarea
              ref={ref}
              id="retraction-reason"
              name="moderationReason"
              rows="4"
            />

            <Controls
              error={deletePrereview.error} // #FIXME
            >
              <Button
                disabled={deletePrereview.loading}
                onClick={() => {
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={deletePrereview.loading}
                isWaiting={deletePrereview.loading}
                onClick={() => {
                  deletePrereview(user, reviewAction)
                    .then(() => alert('PREreview successfully deleted.'))
                    .catch(err => {
                      alert(`An error occurred: ${err}`);
                    });
                }}
              >
                Confirm
              </Button>
            </Controls>
          </Fragment>
        ) : (
          <Fragment>
            <p>{`Success: ${
              defaultFrame === 'ModerateRapidPREreviewAction'
                ? 'the review has now been retracted'
                : defaultFrame === 'IgnoreReportRapidPREreviewAction'
                ? 'the moderation reports have been ignored and will now longer be displayed here'
                : 'the user persona has been blocked and won’t be able to post further reviews'
            }.`}</p>

            <Controls>
              <Button
                onClick={() => {
                  onSuccess(defaultFrame, getId(reviewAction));
                  onClose();
                }}
              >
                Close
              </Button>
            </Controls>
          </Fragment>
        )}
      </div>
    </Modal>
  );
}
ModerationCardModal.propTypes = {
  defaultFrame: PropTypes.oneOf([
    'ModerateRoleAction',
    'ModerateRapidPREreviewAction',
    'IgnoreReportRapidPREreviewAction',
  ]).isRequired,
  user: PropTypes.object.isRequired,
  reviewAction: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
