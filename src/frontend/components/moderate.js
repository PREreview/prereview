import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import socketIoClient from 'socket.io-client';
import { useUser } from '../contexts/user-context';
import { getId } from '../utils/jsonld';
import HeaderBar from './header-bar';
import { ORG } from '../constants';
import { createModerationQs } from '../utils/search';
import { GetPreprint } from '../hooks/api-hooks.tsx';
import Button from './button';
import ModerationCard from './moderation-card';

const socket = socketIoClient(window.location.origin, {
  autoConnect: false,
});

export default function Moderate() {
  const [user] = useUser();
  const [bookmark, setBookmark] = useState(null);
  const [excluded, setExcluded] = useState(new Set());
  const [lockersByReviewActionId, setLockersByReviewActionId] = useState({});

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

  const search = createModerationQs({ bookmark });

  const results = GetPreprint(search, !!bookmark);

  const [isOpenedMap, setIsOpenedMap] = useState(
    results.rows.reduce((map, row) => {
      map[getId(row.doc)] = false;
      return map;
    }, {}),
  );
  useEffect(() => {
    setIsOpenedMap(
      results.rows.reduce((map, row) => {
        map[getId(row.doc)] = false;
        return map;
      }, {}),
    );
  }, [results]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        <title>{ORG} • Moderate Reviews</title>
      </Helmet>
      <HeaderBar closeGap />

      <section>
        <header className="moderate__header">
          <span>Moderate Content</span>
          <span>{results.total_rows} Flagged Reviews</span>
        </header>

        {results.total_rows === 0 && !results.loading ? (
          <div>No reported reviews.</div>
        ) : (
          <div>
            <ul className="moderate__card-list">
              {results.rows
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
                      onSuccess={(moderationActionType, reviewActionId) => {
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
                ))}
            </ul>
          </div>
        )}

        <div>
          {/* Cloudant returns the same bookmark when it hits the end of the list */}
          {!!(
            results.rows.length < results.total_rows &&
            results.bookmark !== bookmark
          ) && (
            <div className="moderate__more">
              <Button
                onClick={e => {
                  e.preventDefault();
                  setBookmark(results.bookmark);
                }}
              >
                More
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
