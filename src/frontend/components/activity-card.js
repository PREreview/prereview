import React from 'react';
import PropTypes from 'prop-types';
import { format, formatDistanceStrict } from 'date-fns';
import { MdChevronRight } from 'react-icons/md';
import { getId } from '../utils/jsonld';
import Value from './value';
import LabelStyle from './label-style';
import XLink from './xlink';
// import {
//   GetUserPreprint // #FIXME
// } from '../hooks/api-hooks.tsx';
import { useAnimatedScore } from '../hooks/score-hooks';
import ScoreBadge from './score-badge';
import AnimatedNumber from './animated-number';

export default function ActivityCard({ preprint }) {
  // const userPreprint = GetUserPreprint(getId(preprint.object));

  const {
    nRequests,
    nReviews,
    now,
    onStartAnim,
    onStopAnim,
    dateFirstActivity,
    isAnimating,
  } = useAnimatedScore(preprint);

  return (
    <div key={getId(preprint)} className="activity-card">
      <LabelStyle>
        {format(new Date(preprint.startTime), 'MMM. d, yyyy')}{' '}
        {preprint['@type'] === 'RequestForRapidPREreviewAction'
          ? 'requested feedback on'
          : 'reviewed'}
      </LabelStyle>
      <div>
        <XLink
          to={`/${preprint.object.doi || preprint.object.arXivId}`}
          href={`/${preprint.object.doi || preprint.object.arXivId}`}
        >
          <Value tagName="span">{preprint.object.name}</Value>
        </XLink>

        <div className="activity-card__server-info">
          <Value tagName="span" className="activity-card__server-name">
            {(preprint.object.preprintServer || {}).name}
          </Value>
          <MdChevronRight className="activity-card__server-arrow-icon" />
          <Value tagName="span">
            {preprint.object.doi ? (
              <a
                href={`https://doi.org/${preprint.object.doi}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {preprint.object.doi}
              </a>
            ) : (
              <a
                href={`https://arxiv.org/abs/${preprint.object.arXivId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {preprint.object.arXivId}
              </a>
            )}
          </Value>
        </div>

        {!preprint.loading && (
          <div className="activity-card__stats">
            <ScoreBadge
              now={now}
              nRequests={nRequests}
              nReviews={nReviews}
              dateFirstActivity={dateFirstActivity}
              onMouseEnter={onStartAnim}
              onMouseLeave={onStopAnim}
              isAnimating={isAnimating}
            />
            <div className="activity-card__count">
              <div className="activity-card__count-badge">
                <AnimatedNumber value={nReviews} isAnimating={isAnimating} />
              </div>
              Review{nReviews > 1 ? 's' : ''}
            </div>
            <div className="activity-card__count">
              <div className="activity-card__count-badge">
                <AnimatedNumber value={nRequests} isAnimating={isAnimating} />{' '}
              </div>
              Request{nRequests > 1 ? 's' : ''}
            </div>
            {isAnimating && (
              <div className="activity-card__count">
                <span className="preprint-card__animation-time">
                  {`(${formatDistanceStrict(new Date(now), new Date())} ago)`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

ActivityCard.propTypes = {
  preprint: PropTypes.object.isRequired,
};
