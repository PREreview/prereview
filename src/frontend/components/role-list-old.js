// base imports
import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import classNames from 'classnames';

// Material UI imports
import Typography from '@material-ui/core/Typography';

import { MdClear } from 'react-icons/md';
import RoleBadge from './role-badge';
import IconButton from './icon-button';

export function PotentialRoles({
  user,
  allReviews,
  onRemoved,
  onModerate,
  isModerationInProgress,
  hasReviewed,
}) {
  const [reviews] = useState(allReviews);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    let newAuthors = [];
    reviews.map(review => {
      if (review.author) {
        newAuthors = [...newAuthors, review.author];
      } else if (review.authors) {
        if (review.isPublished) {
          review.authors.map(author => (newAuthors = [...newAuthors, author]));
        }
      }
      return newAuthors;
    });

    if (hasReviewed) {
      newAuthors = [...newAuthors, user];
    }

    const filteredAuthors = newAuthors.filter(
      (author, i, authors) =>
        i === authors.findIndex(a => a.uuid === author.uuid),
    );

    setAuthors(filteredAuthors);
  }, []);

  useEffect(() => {}), [authors];

  return (
    <div>
      {!authors.length && (
        <Typography variant="body1" component="div">
          No reviewers.
        </Typography>
      )}

      <ul className="role-list__list">
        {authors.length
          ? authors.map(author => {
              return (
                <li key={author.uuid} className="role-list__list-item">
                  <RoleBadge
                    author={author}
                    onDropped={author => {
                      onRemoved(author.uuid);
                    }}
                  >
                    {user && user.isAdmin && (
                      <div
                        disabled={isModerationInProgress || author.uuid}
                        onSelect={() => {
                          onModerate(author.uuid);
                        }}
                      >
                        Report Review
                      </div>
                    )}
                  </RoleBadge>
                </li>
              );
            })
          : null}
      </ul>
    </div>
  );
}

PotentialRoles.propTypes = {
  user: PropTypes.object,
  allReviews: PropTypes.array.isRequired,
  onModerate: PropTypes.func,
  isModerationInProgress: PropTypes.bool,
  onRemoved: PropTypes.func.isRequired,
  roleIds: PropTypes.arrayOf(PropTypes.object),
  hasReviewed: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
    PropTypes.string,
  ]),
};
