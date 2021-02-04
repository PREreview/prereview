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
import ModerationCard from './moderation-card';

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

  // const [isOpenedMap, setIsOpenedMap] = useState(
  //   results.rows.reduce((map, row) => {
  //     map[getId(row.doc)] = false;
  //     return map;
  //   }, {}),
  // );
  // useEffect(() => {
  //   setIsOpenedMap(
  //     results.rows.reduce((map, row) => {
  //       map[getId(row.doc)] = false;
  //       return map;
  //     }, {}),
  //   );
  // }, [results]);

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

        {results ? (
          results.total_rows === 0 && !results.loading ? (
            <div>No reported reviews.</div>
          ) : (
            <div>
              <ul className="moderate__card-list">
                {results
                  ? results.rows
                      .filter(row => !excluded.has(getId(row.doc)))
                      .map(({ doc }) => (
                        <li key={getId(doc)}>
                          <ModerationCard
                            user={user}
                            reviewAction={doc}
                            isOpened={isOpenedMap[getId(doc)] || false}
                            isLockedBy={lockersByReviewActionId[getId(doc)]}
                            onOpen={() => {
                              socket.emit(
                                'lock',
                                {
                                  reviewActionId: getId(doc),
                                  roleId: user.defaultRole,
                                },
                                isLocked => {
                                  if (!isLocked) {
                                    setIsOpenedMap(
                                      results.rows.reduce((map, row) => {
                                        map[getId(row.doc)] =
                                          getId(row.doc) === getId(doc);
                                        return map;
                                      }, {}),
                                    );
                                  }
                                },
                              );
                            }}
                            onClose={() => {
                              socket.emit('unlock', {
                                reviewActionId: getId(doc),
                                roleId: user.defaultRole,
                              });

                              setIsOpenedMap(
                                results.rows.reduce((map, row) => {
                                  map[getId(row.doc)] = false;
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
                                  reviewActionId: getId(doc),
                                  roleId: user.defaultRole,
                                });
                                socket.emit('exclude', {
                                  reviewActionId: getId(doc),
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
                      ))
                  : null}
              </ul>
            </div>
          )
        ) : null}
      </section>
    </div>
  );
}
