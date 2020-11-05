import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MdChevronRight, MdFirstPage } from 'react-icons/md';
import { getId } from '../utils/jsonld';
import { createActivityQs } from '../utils/search';
import { GetPreprints } from '../hooks/api-hooks.tsx';
import Button from './button';
import LabelStyle from './label-style';
import ActivityCard from './activity-card';

export default function RoleActivity({ roleId }) {
  const [bookmark, setBookmark] = useState(null);

  const search = createActivityQs({ roleId, bookmark });

  const results = GetPreprints(search);

  return (
    <div className="role-activity">
      {!!results.counts && (
        <dl className="role-activity__summary">
          <dt className="role-activity__summary__label">
            <LabelStyle>Total number of requests</LabelStyle>
          </dt>
          <dd className="role-activity__summary__stat">
            {results.requests || 0}
          </dd>
          <dt className="role-activity__summary__label">
            <LabelStyle>Total number of reviews</LabelStyle>
          </dt>
          <dd className="role-activity__summary__stat">
            {results.reviews || 0}
          </dd>
        </dl>
      )}

      {results.total_rows === 0 && !results.loading ? (
        <div>No activity yet.</div>
      ) : bookmark && results.bookmark === bookmark && !results.loading ? (
        <div>No more activity.</div>
      ) : (
        <section className="role-activity__history">
          <h3 className="role-activity__sub-title">History</h3>
          <ul className="role-activity__list">
            {results.rows.map(({ doc }) => (
              <li key={getId(doc)} className="role-activity__list-item">
                <ActivityCard preprint={doc} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="role-activity__pagination">
        {/* Cloudant returns the same bookmark when it hits the end of the list */}
        {!!bookmark && (
          <Button
            onClick={() => {
              setBookmark(null);
            }}
          >
            <MdFirstPage /> First page
          </Button>
        )}

        {!!(
          results.rows.length < results.total_rows &&
          results.bookmark !== bookmark
        ) && (
          <Button
            onClick={() => {
              setBookmark(results.bookmark);
            }}
          >
            Next Page <MdChevronRight />
          </Button>
        )}
      </div>
    </div>
  );
}

RoleActivity.propTypes = {
  roleId: PropTypes.string.isRequired,
};
