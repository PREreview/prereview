// base imports
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import socketIoClient from 'socket.io-client';

// contexts
import UserProvider from '../contexts/user-context';

// utils
import { getId } from '../utils/jsonld';

// hooks
import { useGetFullReviews } from '../hooks/api-hooks.tsx';

// components
import Button from './button';
import HeaderBar from './header-bar';
import Loading from './loading';
import ModerationCard from './moderation-card';
import NotFound from './not-found';

// constants
import { ORG } from '../constants';

const socket = socketIoClient(window.location.origin, {
  autoConnect: false,
});

export default function Moderate() {
  const [user] = useContext(UserProvider.context);
  const [excluded, setExcluded] = useState(new Set());
  const [lockersByReviewActionId, setLockersByReviewActionId] = useState({});

  const { data: reviews, loading, error } = useGetFullReviews();

  const [flaggedReviews, setFlaggedReviews] = useState(null);

  // #FIXME refactor to remove callback
  const handleLocked = useCallback(
    data => {
      const nextLockersByReviewActionId = data.reduce((map, item) => {
        if (!user.hasRole.some(roleId => roleId === item.roleId)) {
          map[item.reviewActionId] = item.roleId;
        }
        return map;
      }, {});

      setLockersByReviewActionId(nextLockersByReviewActionId);
    },
    [user],
  );

  let results;

  const [isOpenedMap, setIsOpenedMap] = useState(false);

  useEffect(() => {
    if (flaggedReviews) {
      setIsOpenedMap(
        flaggedReviews.reduce((map, row) => {
          map[row.uuid] = false;
          return map;
        }, {}),
      );
    }
  }, [flaggedReviews]);

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, []);

  useEffect(() => {
    if (!loading) {
      if (reviews && reviews.data.length) {
        const allFlagged = reviews.data.filter(review => review.isFlagged);
        setFlaggedReviews(allFlagged);
      }
    }
  }, [loading, reviews]);

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleExcluded = reviewActionId => {
      setExcluded(prevSet => {
        return new Set(Array.from(prevSet).concat(reviewActionId));
      });
    };

    socket.on('locked', handleLocked);
    socket.on('excluded', handleExcluded);

    return () => {
      socket.off('locked', handleLocked);
      socket.off('excluded', handleExcluded);
    };
  }, [handleLocked]);

  if (loading) {
    return <Loading />;
  } else if (error) {
    return <NotFound />;
  } else {
    return (
      <div className="moderate">
        <Helmet>
          <title>Moderate Reviews • {ORG}</title>
        </Helmet>
        <HeaderBar thisUser={user} closeGap />

        <section>
          <header className="moderate__header">
            <span>Moderate Content</span>
            <span>
              {flaggedReviews && flaggedReviews.length
                ? flaggedReviews.length
                : 'No'}{' '}
              Reviews
            </span>
          </header>

          {flaggedReviews && flaggedReviews.length ? (
            <ul className="moderate__card-list">
              {flaggedReviews.map(review => (
                <li key={review.uuid}>
                  <ModerationCard
                    reviewer={user}
                    review={review}
                    isOpened={true} // FIXME
                    // isOpened={isOpenedMap[review.uuid] || false}
                    isLockedBy={lockersByReviewActionId[review.uuid]}
                    onOpen={() => {
                      socket.emit(
                        'lock',
                        {
                          reviewActionId: review.uuid,
                          roleId: user.uuid,
                        },
                        isLocked => {
                          if (!isLocked) {
                            setIsOpenedMap(
                              flaggedReviews.reduce((map, row) => {
                                map[row.review.uuid] =
                                  row.review.uuid === review.uuid;
                                return map;
                              }, {}),
                            );
                          }
                        },
                      );
                    }}
                    onClose={() => {
                      socket.emit('unlock', {
                        reviewActionId: review.uuid,
                        roleId: user.defaultRole,
                      });

                      setIsOpenedMap(
                        results.rows.reduce((map, row) => {
                          map[review.uuid] = false;
                          return map;
                        }, {}),
                      );
                    }}
                    onSuccess={(
                      moderationActionType,
                      reviewActionId,
                    ) => {
                      if (
                        moderationActionType ===
                          'ModerateRapidPREreviewAction' ||
                        moderationActionType ===
                          'IgnoreReportRapidPREreviewAction'
                      ) {
                        socket.emit('unlock', {
                          reviewActionId: review.uuid,
                          roleId: user.defaultRole,
                        });
                        socket.emit('exclude', {
                          reviewActionId: review.uuid,
                          roleId: user.defaultRole,
                        });

                        setExcluded(
                          new Set(
                            Array.from(excluded).concat(reviewActionId),
                          ),
                        );
                      }
                    }}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div>No reported reviews.</div>
          )}
        </section>
      </div>
    );
  }
}
