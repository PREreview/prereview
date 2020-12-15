import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import classNames from 'classnames';
import { MdClear } from 'react-icons/md';
import { MenuItem } from '@reach/menu-button';
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
  reviews,
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

  // const [reviewsList, setReviewsList] = useState(reviews);

  return (
    <div
      className={classNames('role-list role-list--potential', {
        'role-list--can-drop': canDrop,
        'role-list--is-over': isOver,
      })}
      ref={dropRef}
    >
      {!reviews.length && <p className="role-list__tip-text">No Reviewers</p>}

      <ul className="role-list__list">
        {reviews.length
          ? reviews.map(review => {
              if (review.authors) {
                return review.authors.map(author => {
                  return (
                    <li key={author.identity}>
                      <DraggableRoleBadge
                        type={POTENTIAL_ROLE_TYPE}
                        author={author}
                        onDropped={author => {
                          onRemoved(author.identity);
                        }}
                      >
                        {user.isAdmin && (
                          <MenuItem
                            disabled={isModerationInProgress || author.identity}
                            onSelect={() => {
                              onModerate(author.identity);
                            }}
                          >
                            Report Review
                          </MenuItem>
                        )}
                      </DraggableRoleBadge>
                    </li>
                  );
                });
              } else if (review.author) {
                return (
                  <li key={review.author.identity}>
                    <DraggableRoleBadge
                      type={POTENTIAL_ROLE_TYPE}
                      author={review.author}
                      onDropped={review => {
                        onRemoved(review.author.identity);
                      }}
                    >
                      {user.isAdmin && (
                        <MenuItem
                          disabled={
                            isModerationInProgress || review.author.identity
                          }
                          onSelect={() => {
                            onModerate(review.author.identity);
                          }}
                        >
                          Report Review
                        </MenuItem>
                      )}
                    </DraggableRoleBadge>
                  </li>
                );
              }
            })
          : null}
        {user && hasReviewed ? (
          <li key={user.identity}>
            <DraggableRoleBadge
              type={POTENTIAL_ROLE_TYPE}
              author={user}
              onDropped={() => {
                onRemoved(user.identity);
              }}
            >
              {user.isAdmin && (
                <MenuItem
                  disabled={isModerationInProgress || user.identity}
                  onSelect={() => {
                    onModerate(user.identity);
                  }}
                >
                  Report Review
                </MenuItem>
              )}
            </DraggableRoleBadge>
          </li>
        ) : null}
      </ul>
    </div>
  );
}

PotentialRoles.propTypes = {
  user: PropTypes.object.isRequired,
  reviews: PropTypes.array.isRequired,
  onModerate: PropTypes.func,
  isModerationInProgress: PropTypes.bool,
  onRemoved: PropTypes.func.isRequired,
  roleIds: PropTypes.arrayOf(PropTypes.object),
  hasReviewed: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
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
                <li key={roleId}>
                  <DraggableRoleBadge
                    type={HIGHLIGHTED_ROLE_TYPE}
                    roleId={roleId}
                    onDropped={roleId => {
                      onRemoved([roleId]);
                    }}
                  >
                    <MenuItem
                      onSelect={() => {
                        onRemoved([roleId]);
                      }}
                    >
                      Remove
                    </MenuItem>

                    {!!canModerate && !!reviewer && (
                      <MenuItem
                        disabled={isModerationInProgress || reviewer}
                        onSelect={() => {
                          onModerate(reviewer);
                        }}
                      >
                        Report Review
                      </MenuItem>
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
