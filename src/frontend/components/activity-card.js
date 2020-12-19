import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { format, formatDistanceStrict } from 'date-fns';
import { useGetPreprint } from '../hooks/api-hooks.tsx';
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
import NotFound from './not-found';

export default function ActivityCard({ preprintId }) {
  const [loading, setLoading] = useState(true);
  const [preprint, setPreprint] = useState(null);
  const [activity, setActivity] = useState(null);

  const {
    data: preprintData,
    loading: loadingPreprint,
    error,
  } = useGetPreprint({
    id: preprintId,
  });

  useEffect(() => {
    if (!loadingPreprint) {
      if (preprintData) {
        console.log(preprintData.data[0]);
        setActivity(useAnimatedScore(preprintData.data[0]));
        setPreprint(preprintData.data[0]);
        setLoading(false);
      }
    }
  }, [loadingPreprint, preprintData]);

  if (error) {
    // #FIXME
    return <NotFound />;
  } else if (loading) {
    return <div>Loading...</div>;
  } else {
    return (
      <div key={preprint.id} className="activity-card">
        <LabelStyle>
          {format(new Date(preprint.createdAt), 'MMM. d, yyyy')}{' '}
          {preprint['@type'] === 'RequestForRapidPREreviewAction'
            ? 'requested feedback on'
            : 'reviewed'}
        </LabelStyle>
        <div>
          <XLink to={`/${preprint.handle}`} href={`/${preprint.handle}`}>
            <Value tagName="span">{preprint.title}</Value>
          </XLink>

          <div className="activity-card__server-info">
            <Value tagName="span" className="activity-card__server-name">
              {preprint.preprintServer}
            </Value>
            <MdChevronRight className="activity-card__server-arrow-icon" />
            <Value tagName="span">
              {preprint.handle ? (
                <a
                  href={`https://doi.org/${preprint.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {preprint.handle}
                </a>
              ) : (
                <a
                  href={`https://arxiv.org/abs/${preprint.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {preprint.handle}
                </a>
              )}
            </Value>
          </div>

          <div className="activity-card__stats">
            <ScoreBadge
              now={activity.now}
              nRequests={activity.nRequests}
              nReviews={activity.nReviews}
              dateFirstActivity={activity.dateFirstActivity}
              onMouseEnter={activity.onStartAnim}
              onMouseLeave={activity.onStopAnim}
              isAnimating={activity.isAnimating}
            />
            <div className="activity-card__count">
              <div className="activity-card__count-badge">
                <AnimatedNumber
                  value={activity.nReviews}
                  isAnimating={activity.isAnimating}
                />
              </div>
              Review{activity.nReviews > 1 ? 's' : ''}
            </div>
            <div className="activity-card__count">
              <div className="activity-card__count-badge">
                <AnimatedNumber
                  value={activity.nRequests}
                  isAnimating={activity.isAnimating}
                />{' '}
              </div>
              Request{activity.nRequests > 1 ? 's' : ''}
            </div>
            {activity.isAnimating && (
              <div className="activity-card__count">
                <span className="preprint-card__animation-time">
                  {`(${formatDistanceStrict(
                    new Date(activity.now),
                    new Date(),
                  )} ago)`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

ActivityCard.propTypes = {
  preprintId: PropTypes.number.isRequired,
};
