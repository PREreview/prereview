import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MdChevronRight, MdFirstPage } from 'react-icons/md';
import Button from './button';
import LabelStyle from './label-style';
import ActivityCard from './activity-card';

export default function RoleActivity({ persona }) {
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    const reviews = persona.fullReviews
      ? persona.fullReviews.filter(item => item.isPublished)
      : null;

    const fullReviews = reviews.map(review => ({...review, isLongReview: true}))

    setActivity(() =>
      [fullReviews, persona.rapidReviews, persona.requests].flat(),
    );
  }, [persona]);

  return (
    <div className="role-activity">
      {activity && activity.length ? (
        <div className="role-activity__summary">
          <div className="role-activity__summary">
            <LabelStyle>
              Total number of requests:{' '}
              {persona.requests ? persona.requests.length || 0 : ''}
            </LabelStyle>
          </div>
          <div className="role-activity__summary">
            <LabelStyle>
              Total number of rapid reviews:{' '}
              {persona.rapidReviews ? persona.rapidReviews.length || 0 : ''}
            </LabelStyle>
          </div>

          <div className="role-activity__summary">
            <LabelStyle>
              Total number of long-form reviews:{' '}
              {persona.fullReviews
                ? persona.fullReviews.filter(review => review.isPublished)
                    .length || 0
                : null}
            </LabelStyle>
          </div>
        </div>
      ) : null}

      {!activity || !activity.length ? (
        <div>{persona.name} hasn't yet reviewed or requested reviews for preprints.</div>
      ) : (
        <section className="role-activity__history">
          <ul className="role-activity__list">
            {activity.length &&
              activity.map(activity => (
                <li key={activity.handle} className="role-activity__list-item">
                  <ActivityCard key={activity.uuid} activity={activity} />
                </li>
              ))}
          </ul>
        </section>
      )}

      {/* <div className="role-activity__pagination">
        <Button
          disabled
          onClick={() => {
            // #FIXME pagination
          }}
        >
          <MdFirstPage /> First page
        </Button>

        <Button
          disabled
          onClick={() => {
            // #FIXME pagination
          }}
        >
          Next Page <MdChevronRight />
        </Button>
      </div> */}
    </div>
  );
}

RoleActivity.propTypes = {
  persona: PropTypes.object.isRequired,
};
