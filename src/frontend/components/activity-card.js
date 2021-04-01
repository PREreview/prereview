import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { format, formatDistanceStrict } from 'date-fns';
import { useGetPreprint } from '../hooks/api-hooks.tsx';
import { createPreprintId } from '../../common/utils/ids.js';
import Value from './value';
import LabelStyle from './label-style';
import XLink from './xlink';
import AnimatedNumber from './animated-number';
import NotFound from './not-found';
import { MdChevronRight } from 'react-icons/md';

export default function ActivityCard({ activity }) {
  const [loading, setLoading] = useState(true);
  const [preprint, setPreprint] = useState(null);

  const {
    data: preprintData,
    loading: loadingPreprint,
    error,
  } = useGetPreprint({
    id: createPreprintId(activity.preprint.handle),
  });

  useEffect(() => {
    if (!loadingPreprint) {
      if (preprintData) {
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
      <div key={preprint.uuid} className="activity-card">
        <LabelStyle>
          {format(new Date(activity.createdAt), 'yyyy/MM/dd')}{' '}
          {activity.ynPeerReview || activity.isLongReview 
            ? 'reviewed'
            : 'requested feedback for'}
        </LabelStyle>
        <div>
          <XLink
            to={`/preprints/${createPreprintId(preprint.handle)}`}
            href={`/preprints/${createPreprintId(preprint.handle)}`}
          >
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
            <div className="activity-card__count">
              <div className="activity-card__count-badge">
                <AnimatedNumber
                  value={preprint.rapidReviews.length}
                  isAnimating={false} // #FIXME
                />
              </div>
              Rapid Review{preprint.rapidReviews.length > 1 ? 's' : ''}
            </div>
            <div className="activity-card__count">
              <div className="activity-card__count-badge">
                <AnimatedNumber
                  value={preprint.fullReviews.length}
                  isAnimating={false} // #FIXME
                />
              </div>
              Long-form Review{preprint.fullReviews.length > 1 ? 's' : ''}
            </div>
            <div className="activity-card__count">
              <div className="activity-card__count-badge">
                <AnimatedNumber
                  value={preprint.requests.length}
                  isAnimating={false} // #FIXME
                />{' '}
              </div>
              Request{preprint.requests.length > 1 ? 's' : ''}
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
  activity: PropTypes.object.isRequired,
};
