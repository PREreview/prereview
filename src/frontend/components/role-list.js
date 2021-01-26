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
export function PotentialRoles({
  user,
  allReviews,
  onRemoved,
  onModerate,
  isModerationInProgress,
  hasReviewed,
}) {
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
        newAuthors = [...newAuthors, review.author];
      } else if (review.authors) {
        if (review.published) {
          review.authors.map(author => {
            newAuthors = [...authors, author];
          });
        }
      }
      return;
    });

    if (hasReviewed) {
      newAuthors = [...newAuthors, user];
    }

    const filteredAuthors = newAuthors.filter(
      (author, i, authors) => i === authors.findIndex(a => a.id === author.id),
    );

    setAuthors(filteredAuthors);
  }, []);

  useEffect(() => {}), [authors];

  // const filteredReviews = reviews.filter((review, index, reviews) => {
  //   if (review.author) {
  //     return (
  //       index ===
  //       reviews.findIndex(r => {
  //         if (r.author) {
  //           if (r.author.identity.defaultPersona) {
  //             return r.author.identity.defaultPersona.id === review.author.id;
  //           } else {
  //             return r.author.identity.id === review.author.id;
  //           }
  //         }
  //       })
  //     );
  //   } else if (review.authors) {
  //     review.authors.filter((author, i, authors) => {
  //       i === authors.findIndex(a => a.id === author.id);
  //     });
  //   }
  //   return review;
  // });

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
          ? authors.map(author => {
              return (
                <li key={author.id} className="role-list__list-item">
                  <DraggableRoleBadge
                    type={POTENTIAL_ROLE_TYPE}
                    author={author}
                    onDropped={author => {
                      onRemoved(author.identity);
                    }}
                  >
                    {user && user.isAdmin && (
                      <div
                        disabled={isModerationInProgress || author.identity}
                        onSelect={() => {
                          onModerate(author.identity);
                        }}
                      >
                        Report Review
                      </div>
                    )}
                  </DraggableRoleBadge>
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

function DraggableRoleBadge({ author, onDropped, children, type }) {
  const roleId = author.identity;

  const [{ isDragging }, dragRef] = useDrag({
    item: { roleId, type },
    end(item, monitor) {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        onDropped(item.roleId);
      }
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Fragment>
      <RoleBadge
        user={author}
        tooltip={true}
        ref={dragRef}
        roleId={roleId}
        className={classNames('draggable-role-badge', {
          'draggable-role-badge--dragging': isDragging,
        })}
        disabled={isDragging}
      >
        {children}
      </RoleBadge>
    </Fragment>
  );
}

DraggableRoleBadge.propTypes = {
  author: PropTypes.object.isRequired,
  onDropped: PropTypes.func.isRequired,
  children: PropTypes.any,
  type: PropTypes.oneOf([POTENTIAL_ROLE_TYPE, HIGHLIGHTED_ROLE_TYPE]),
};

/**
 * This act as a drop target for the `PotentialRoles`
 * Note: this is also a draggable so that dragged role can be dragged back to
 *`PotentialRoles`
 */
export function HighlightedRoles({
  reviews,
  roleIds = [],
  onRemoved,
  onModerate,
  canModerate,
  isModerationInProgress,
}) {
  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: POTENTIAL_ROLE_TYPE,
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      className={classNames('role-list role-list--highlighted', {
        'role-list--can-drop': canDrop,
        'role-list--is-over': isOver,
      })}
      ref={dropRef}
    >
      <p className="role-list__tip-text">
        {roleIds.length ? (
          <span>Selected Reviewers</span>
        ) : (
          <span>Viewing all reviews</span>
        )}
      </p>
      <ul className="role-list__list">
        {roleIds.length
          ? roleIds.map(roleId => {
              const reviewer = reviews.find(review => review.id === roleId);

              return (
                <li key={roleId} className="role-list__list-item">
                  <DraggableRoleBadge
                    type={HIGHLIGHTED_ROLE_TYPE}
                    roleId={roleId}
                    onDropped={roleId => {
                      onRemoved([roleId]);
                    }}
                  >
                    <div
                      onSelect={() => {
                        onRemoved([roleId]);
                      }}
                    >
                      Remove
                    </div>

                    {!!canModerate && !!reviewer && (
                      <div
                        disabled={isModerationInProgress || reviewer}
                        onSelect={() => {
                          onModerate(reviewer);
                        }}
                      >
                        Report Review
                      </div>
                    )}
                  </DraggableRoleBadge>
                </li>
              );
            })
          : null}
      </ul>
      {roleIds.length ? (
        <IconButton
          className="role-list__clear-button"
          onClick={() => {
            onRemoved(roleIds);
          }}
        >
          <MdClear className="role-list__clear-button__icon" />
        </IconButton>
      ) : (
        ''
      )}
    </div>
  );
}

HighlightedRoles.propTypes = {
  reviews: PropTypes.array.isRequired,
  canModerate: PropTypes.bool,
  onModerate: PropTypes.func,
  isModerationInProgress: PropTypes.bool,
  roleIds: PropTypes.arrayOf(PropTypes.number),
  onRemoved: PropTypes.func.isRequired,
};
