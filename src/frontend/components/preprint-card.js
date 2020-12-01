import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import classNames from 'classnames';
import { formatDistanceStrict } from 'date-fns';
import {
  MdTimeline,
  MdCode,
  MdChevronRight,
  MdExpandLess,
  MdExpandMore,
} from 'react-icons/md';
import Tooltip from '@reach/tooltip';
import Value from './value';
import { getTags } from '../utils/stats';
import { checkIfHasReviewed, checkIfHasRequested } from '../utils/actions';
import ScoreBadge from './score-badge';
import IconButton from './icon-button';
import TagPill from './tag-pill';
import addPrereviewIcon from '../svgs/add_prereview_icon.svg';
import Collapse from './collapse';
import ReviewReader from './review-reader';
import XLink from './xlink';
import Button from './button';
import { useAnimatedScore } from '../hooks/score-hooks';
import { getFormattedDatePosted } from '../utils/preprints';
import AnimatedNumber from './animated-number';
import {
  createPreprintId,
  decodePreprintId,
  getCanonicalArxivUrl,
  getCanonicalDoiUrl,
} from '../../common/utils/ids.js';

export default function PreprintCard({
  user,
  preprint,
  onNewRequest,
  onNewReview,
  onNew,
  sortOption,
  hoveredSortOption,
  isNew = false,
}) {
  const [isOpened, setIsOpened] = useState(false);

  const { title, preprintServer, handle, createdAt } = preprint;

  const preprintId = createPreprintId(handle);
  const { id, scheme } = decodePreprintId(preprintId);

  const hasReviewed = checkIfHasReviewed(user, preprint.reviews); // `actions` (_all_ of them including moderated ones) not `safeActions`
  const hasRequested = checkIfHasRequested(user, preprint.requests); // `actions` (_all_ of them including moderated ones) not `safeActions`

  const { hasData, hasCode, subjects } = getTags(preprint);

  const {
    nRequests,
    nReviews,
    now,
    onStartAnim,
    onStopAnim,
    dateFirstActivity,
    dateLastActivity,
    lastActionType,
    dateLastReview,
    dateLastRequest,
    isAnimating,
  } = useAnimatedScore(preprint);

  const agoData = getAgoData(
    sortOption,
    hoveredSortOption,
    lastActionType,
    dateLastReview,
    dateLastRequest,
    dateLastActivity,
  );

  return (
    <Fragment>
      <div
        className={classNames('preprint-card', { 'preprint-card--new': isNew })}
      >
        <div className="preprint-card__contents">
          <div className="preprint-card__header">
            <div className="preprint-card__header__left">
              <XLink
                href={`/preprints/${preprintId}`}
                to={{
                  pathname: `/preprints/${preprintId}`,
                  state: {
                    preprint: omit(preprint, ['potentialAction']),
                    tab: 'read',
                  },
                }}
                className="preprint-card__title"
              >
                {!!title && (
                  <Value tagName="h2" className="preprint-card__title-text">
                    {title}
                  </Value>
                )}
              </XLink>
            </div>

            {!!createdAt && (
              <span
                className={classNames('preprint-card__pub-date', {
                  'preprint-card__pub-date--highlighted':
                    hoveredSortOption === 'date',
                })}
              >
                {getFormattedDatePosted(createdAt)}
              </span>
            )}
          </div>
          <div className="preprint-card__info-row">
            <div className="preprint-card__info-row__left">
              {!!preprintServer && (
                <Value tagName="span" className="preprint-card__server-name">
                  {preprintServer}
                </Value>
              )}
              <MdChevronRight className="preprint-card__server-arrow-icon" />
              <Value tagName="span" className="preprint-card__server-id">
                {scheme === 'doi' ? (
                  <a
                    href={`${getCanonicalDoiUrl(id)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {id}
                  </a>
                ) : (
                  <a
                    href={`${getCanonicalArxivUrl(id)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {id}
                  </a>
                )}
              </Value>
            </div>

            <div className="preprint-card__info-row__right">
              <ul className="preprint-card__tag-list">
                {subjects.map(subject => (
                  <li key={subject} className="preprint-card__tag-list__item">
                    <Tooltip
                      label={`Majority of reviewers tagged with ${subject}`}
                    >
                      <div>
                        <TagPill>{subject}</TagPill>
                      </div>
                    </Tooltip>
                  </li>
                ))}
                <li className="preprint-card__tag-list__item">
                  <Tooltip
                    label={
                      hasData
                        ? 'Majority of reviewers reported data'
                        : 'Majority of reviewers did not report data'
                    }
                  >
                    <div
                      className={`preprint-card__tag-icon ${
                        hasData
                          ? 'preprint-card__tag-icon--active'
                          : 'preprint-card__tag-icon--inactive'
                      }`}
                    >
                      <MdTimeline className="preprint-card__tag-icon__icon" />
                    </div>
                  </Tooltip>
                </li>
                <li className="preprint-card__tag-list__item">
                  <Tooltip
                    label={
                      hasCode
                        ? 'Majority of reviewers reported code'
                        : 'Majority of reviewers did not report code'
                    }
                  >
                    <div
                      className={`preprint-card__tag-icon ${
                        hasCode
                          ? 'preprint-card__tag-icon--active'
                          : 'preprint-card__tag-icon--inactive'
                      }`}
                    >
                      <MdCode className="preprint-card__tag-icon__icon" />
                    </div>
                  </Tooltip>
                </li>
              </ul>
            </div>
          </div>

          <div className="preprint-card__expansion-header">
            <div className="preprint-card__expansion-header__left">
              {/*<Tooltip label="Number of reviews and requests for reviews for this preprint">*/}
              {/* ScoreBadge uses forwardRef but Tooltip doesn't work without extra div :( */}
              <div className="preprint-card__score-badge-container">
                {isNew ? (
                  <div className="preprint-card__new-badge">new</div>
                ) : (
                  <ScoreBadge
                    isHighlighted={hoveredSortOption === 'score'}
                    now={now}
                    nRequests={nRequests}
                    nReviews={nReviews}
                    dateFirstActivity={dateFirstActivity}
                    onMouseEnter={onStartAnim}
                    onMouseLeave={onStopAnim}
                    isAnimating={isAnimating}
                  />
                )}
              </div>
              {/*</Tooltip>*/}
              <button
                className="preprint-card__cta-button"
                disabled={hasReviewed && hasRequested}
                onClick={() => {
                  if (!hasReviewed && !hasRequested) {
                    onNew(preprint);
                  } else if (!hasReviewed && hasRequested) {
                    onNewReview(preprint);
                  } else if (hasReviewed && !hasRequested) {
                    onNewRequest(preprint);
                  }
                }}
              >
                <div className="preprint-card__cta-button__contents">
                  <div className="preprint-card__cta-button__icon-container">
                    <img
                      src={addPrereviewIcon}
                      className="preprint-card__cta-button__icon"
                      aria-hidden="true"
                      alt=""
                    />
                  </div>
                  <div className="preprint-card__count-badge">
                    <AnimatedNumber
                      value={nReviews}
                      isAnimating={isAnimating}
                    />
                  </div>

                  <div className="preprint-card__count-label">
                    Review{nReviews > 1 ? 's' : ''}
                  </div>
                  <div className="preprint-card__count-divider" />
                  <div className="preprint-card__count-badge">
                    <AnimatedNumber
                      value={nRequests}
                      isAnimating={isAnimating}
                    />
                  </div>
                  <div className="preprint-card__count-label">
                    Request{nRequests > 1 ? 's' : ''}
                  </div>

                  {isAnimating && (
                    <span className="preprint-card__animation-time">
                      {`(${formatDistanceStrict(
                        new Date(now),
                        new Date(),
                      )} ago)`}
                    </span>
                  )}
                </div>
              </button>
            </div>
            <div className="preprint-card__expansion-header__right">
              <span
                className={classNames('preprint-card__days-ago', {
                  'preprint-card__days-ago--highlighted':
                    hoveredSortOption === 'new' ||
                    hoveredSortOption === 'reviewed' ||
                    hoveredSortOption === 'requested',
                })}
              >
                <span className="preprint-card__days-ago__prefix">
                  Last {agoData.verb}{' '}
                </span>
                {formatDistanceStrict(new Date(agoData.date), new Date())} ago
              </span>

              <IconButton
                className="preprint-card__expansion-toggle"
                onClick={e => {
                  setIsOpened(!isOpened);
                }}
              >
                {isOpened ? (
                  <MdExpandLess className="preprint-card__expansion-toggle-icon" />
                ) : (
                  <MdExpandMore className="preprint-card__expansion-toggle-icon" />
                )}
              </IconButton>
            </div>
          </div>
        </div>
      </div>
      <Collapse isOpened={isOpened} className="preprint-card__collapse">
        <div className="preprint-card-expansion">
          <ReviewReader
            user={user}
            identifier={id}
            actions={preprint.fullReviews}
            preview={true}
          />

          <div className="preprint-card__view-more">
            <div>
              {!hasReviewed && (
                <Button
                  onClick={() => {
                    onNewReview(preprint);
                  }}
                >
                  Add Review
                </Button>
              )}

              {!hasRequested && (
                <Button
                  onClick={() => {
                    onNewRequest(preprint);
                  }}
                >
                  Request Review
                </Button>
              )}

              <Button
                element="XLink"
                to={`/preprints/${preprintId}`}
                href={`/preprints/${preprintId}`}
              >
                View More
              </Button>
            </div>
          </div>
        </div>
      </Collapse>
    </Fragment>
  );
}

PreprintCard.propTypes = {
  user: PropTypes.object,
  preprint: PropTypes.shape({
    handle: PropTypes.string,
    createdAt: PropTypes.string,
    title: PropTypes.string.isRequired,
    preprintServer: PropTypes.string.isRequired,
    reviews: PropTypes.array,
    requests: PropTypes.array,
  }).isRequired,
  onNewRequest: PropTypes.func.isRequired,
  onNewReview: PropTypes.func.isRequired,
  onNew: PropTypes.func.isRequired,
  isNew: PropTypes.bool,
  sortOption: PropTypes.oneOf([
    'score',
    'new',
    'reviewed',
    'requested',
    'date',
  ]),
  hoveredSortOption: PropTypes.oneOf([
    'score',
    'new',
    'reviewed',
    'requested',
    'date',
  ]),
};

function getAgoData(
  sortOption,
  hoveredSortOption,
  lastActionType,
  dateLastReview,
  dateLastRequest,
  dateLastActivity,
) {
  const option = hoveredSortOption || sortOption;

  switch (option) {
    case 'new':
    case 'score':
    case 'date':
      return {
        verb:
          lastActionType === 'RapidPREreviewAction' ? 'reviewed' : 'requested',
        date: dateLastActivity,
      };

    case 'reviewed':
      return dateLastReview
        ? {
            verb: 'reviewed',
            date: dateLastReview,
          }
        : {
            verb: 'requested',
            date: dateLastRequest,
          };

    case 'requested':
      return dateLastRequest
        ? {
            verb: 'requested',
            date: dateLastRequest,
          }
        : {
            verb: 'reviewed',
            date: dateLastReview,
          };
  }
}
