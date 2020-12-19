import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MdChevronRight, MdFirstPage } from 'react-icons/md';
import { getId } from '../utils/jsonld';
import { createActivityQs } from '../utils/search';
import { GetPreprints } from '../hooks/api-hooks.tsx';
import Button from './button';
import LabelStyle from './label-style';
import ActivityCard from './activity-card';

export default function RoleActivity({ persona }) {

  return (
    <div className="role-activity">
      {(persona.rapidReviews || persona.fullReviews) && (
        <dl className="role-activity__summary">
          <dt className="role-activity__summary__label">
            <LabelStyle>Total number of requests</LabelStyle>
          </dt>
          <dd className="role-activity__summary__stat">
            {persona.requests ? persona.requests.length : 0}
          </dd>
          <dt className="role-activity__summary__label">
            <LabelStyle>Total number of rapid reviews</LabelStyle>
          </dt>
          <dd className="role-activity__summary__stat">
            {persona.rapidReviews.length || 0}
          </dd>
          <dt className="role-activity__summary__label">
            <LabelStyle>Total number of longform reviews</LabelStyle>
          </dt>
          <dd className="role-activity__summary__stat">
            {persona.fullReviews.length || 0}
          </dd>
        </dl>
      )}

      {!persona.requests && !persona.fullReviews && !persona.rapidReviews ? (
        <div>No activity yet.</div>
      ) : (
        <section className="role-activity__history">
          <h3 className="role-activity__sub-title">History</h3>
          <ul className="role-activity__list">
            {persona.rapidReviews.map(review => (
              <li key={review.id} className="role-activity__list-item">
                <ActivityCard preprint={review} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="role-activity__pagination">
        <Button
          onClick={() => {
            // #FIXME pagination
          }}
        >
          <MdFirstPage /> First page
        </Button>

        <Button
          onClick={() => {
            // #FIXME pagination
          }}
        >
          Next Page <MdChevronRight />
        </Button>
      </div>
    </div>
  );
}

RoleActivity.propTypes = {
  persona: PropTypes.object.isRequired,
};
