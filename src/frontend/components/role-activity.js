import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MdChevronRight, MdFirstPage } from 'react-icons/md';
import Button from './button';
import LabelStyle from './label-style';
import ActivityCard from './activity-card';

export default function RoleActivity({ persona }) {
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    const fullReviews = persona.fullReviews
      ? persona.fullReviews.filter(item => item.isPublished)
      : null;

    setActivity(() => [fullReviews, persona.rapidReviews].flat());
  }, []);

  return (
    <div className="role-activity">
      {activity && activity.length ? (
        <dl className="role-activity__summary">
          <dt className="role-activity__summary__label">
            <LabelStyle>Total number of requests</LabelStyle>
          </dt>
          <dd className="role-activity__summary__stat">
            {persona.requests.length || 0}
          </dd>
          <dt className="role-activity__summary__label">
            <LabelStyle>Total number of rapid reviews</LabelStyle>
          </dt>
          <dd className="role-activity__summary__stat">
            {persona.rapidReviews.length || 0}
          </dd>
          <dt className="role-activity__summary__label">
            <LabelStyle>Total number of long-form reviews</LabelStyle>
          </dt>
          <dd className="role-activity__summary__stat">
            {persona.fullReviews.filter(review => review.isPublished).length || 0}
          </dd>
        </dl>
      ) : null}

      {!activity || !activity.length ? (
        <div>No activity yet.</div>
      ) : (
        <section className="role-activity__history">
          <h3 className="role-activity__sub-title">History</h3>
          <ul className="role-activity__list">
            {activity.length &&
              activity.map(activity => (
                <li key={activity.handle} className="role-activity__list-item">
                  <ActivityCard activity={activity} />
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
