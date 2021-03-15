import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import classNames from 'classnames';
import { MdClear } from 'react-icons/md';
import RoleBadge from './role-badge';
import IconButton from './icon-button';

// !! there is currently a bug in chrome for DnD over an inline PDF (dragover events are not emitted)
// see https://bugs.chromium.org/p/chromium/issues/detail?id=984891&q=drag%20object&colspec=ID%20Pri%20M%20Stars%20ReleaseBlock%20Component%20Status%20Owner%20Summary%20OS%20Modified

const POTENTIAL_ROLE_TYPE = Symbol('dnd:potential-role-type');
const HIGHLIGHTED_ROLE_TYPE = Symbol('dnd:highlighted-role-type');

/**
 * Allow roles to be dragged to `HighlightedRoles`.
 * Note: this is also a drop zone for the `HighlightedRoles`
 * so that dragged role can be dragged back
 */
export function Reviewers({ user, allReviews, hasReviewed }) {
  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: HIGHLIGHTED_ROLE_TYPE,
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const [reviews] = useState(allReviews);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    let newAuthors = [];
    reviews.map(review => {
      if (review.author) {
        const newAuthor = review.author;
        newAuthor.reviewUuid = review.uuid;
        newAuthors = [...newAuthors, newAuthor];
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
    <div
      className={classNames('role-list role-list--potential', {
        'role-list--can-drop': canDrop,
        'role-list--is-over': isOver,
      })}
      ref={dropRef}
    >
      {!authors.length && <p className="role-list__tip-text">No Reviewers</p>}

      <ul className="role-list__list">
        {authors.length
          ? authors.map(author => (
              <li key={author.uuid} className="role-list__list-item">
                <RoleBadge
                  user={author}
                  tooltip={true}
                  className={classNames('draggable-role-badge')}
                />
              </li>
            ))
          : null}
      </ul>
    </div>
  );
}

Reviewers.propTypes = {
  user: PropTypes.object,
  allReviews: PropTypes.array.isRequired,
  roleIds: PropTypes.arrayOf(PropTypes.object),
  hasReviewed: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
    PropTypes.string,
  ]),
};
