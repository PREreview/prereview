import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { MdChevronRight, MdFirstPage } from 'react-icons/md';
import { getId } from '../utils/jsonld';
import { createActivityQs } from '../utils/search';
import { useActionsSearchResults } from '../hooks/api-hooks';
import Value from './value';
import Button from './button';
import LabelStyle from './label-style';
import XLink from './xlink';
import ActivityCard from './activity-card';

export default function RoleActivity({ roleId }) {
  const [bookmark, setBookmark] = useState(null);

  const search = createActivityQs({ roleId, bookmark });

  const [results, progress] = useActionsSearchResults(search);

  return (
    <div className="role-activity">
      {!!(results.counts && results.counts['@type']) && (
        <dl className="role-activity__summary">
          <dt className="role-activity__summary__label">
            <LabelStyle>Total number of requests</LabelStyle>
          </dt>
          <dd className="role-activity__summary__stat">
            {results.counts['@type']['RequestForRapidPREreviewAction'] || 0}
          </dd>
          <dt className="role-activity__summary__label">
            <LabelStyle>Total number of reviews</LabelStyle>
          </dt>
          <dd className="role-activity__summary__stat">
            {results.counts['@type']['RapidPREreviewAction'] || 0}
          </dd>
        </dl>
      )}

      {results.total_rows === 0 && !progress.isActive ? (
        <div>No activity yet.</div>
      ) : bookmark && results.bookmark === bookmark && !progress.isActive ? (
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
