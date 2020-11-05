import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import omit from 'lodash/omit';
import { MdChevronRight, MdFirstPage } from 'react-icons/md';
import PrivateRoute from './private-route';
import { GetPreprints } from '../hooks/api-hooks.tsx';
import {
  useIsNewVisitor,
  useIsMobile,
  useNewPreprints,
} from '../hooks/ui-hooks';
import { useUser } from '../contexts/user-context';
import { unprefix, getId } from '../utils/jsonld';
import HeaderBar from './header-bar';
import SearchBar from './search-bar';
import LeftSidePanel from './left-side-panel';
import PreprintCard from './preprint-card';
import Facets from './facets';
import SortOptions from './sort-options';
import NewPreprint from './new-preprint';
import Modal from './modal';
import Button from './button';
import LoginRequiredModal from './login-required-modal';
import { createPreprintQs, apifyPreprintQs } from '../utils/search';
import WelcomeModal from './welcome-modal';
import XLink from './xlink';
import AddButton from './add-button';
import { ORG } from '../constants';
import Banner from './banner';

export default function Home() {
  const history = useHistory();
  const location = useLocation();

  const [user] = useUser();
  const isMobile = useIsMobile();
  const [showLeftPanel, setShowLeftPanel] = useState(!isMobile);
  const [loginModalOpenNext, setLoginModalOpenNext] = useState(null);
  const isNewVisitor = useIsNewVisitor();
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(true);
  const [newPreprints, setNewPreprints] = useNewPreprints();

  const apiQs = apifyPreprintQs(
    location.search,
    location.state && location.state.bookmark,
  );
  const preprints = GetPreprints(apiQs);

  const [hoveredSortOption, setHoveredSortOption] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [apiQs]);

  const params = new URLSearchParams(location.search);

  const handleNewReview = useCallback(
    preprint => {
      if (user) {
        history.push('/new', {
          preprint: omit(preprint, ['potentialAction']), // #FIXME, do we need omit?
          tab: 'review',
          isSingleStep: true,
        });
      } else {
        setLoginModalOpenNext(
          `/new?identifier=${preprint.doi || preprint.arXivId}&tab=review`,
        );
      }
    },
    [user, history],
  );

  const handleNewRequest = useCallback(
    preprint => {
      if (user) {
        history.push('/new', {
          preprint: omit(preprint, ['potentialAction']), // #FIXME, do we need omit?
          tab: 'request',
          isSingleStep: true,
        });
      } else {
        setLoginModalOpenNext(
          `/new?identifier=${preprint.doi || preprint.arXivId}&tab=request`,
        );
      }
    },
    [user, history],
  );

  const handleNew = useCallback(
    preprint => {
      if (user) {
        history.push('/new', {
          preprint: omit(preprint, ['potentialAction']), // #FIXME, do we need omit?
        });
      } else {
        setLoginModalOpenNext(
          `/new?identifier=${preprint.doi || preprint.arXivId}`,
        );
      }
    },
    [user, history],
  );

  return (
    <div className="home">
      <Helmet>
        <title>{ORG} • Home</title>
      </Helmet>
      <Banner />

      {!!((isNewVisitor || params.get('welcome')) && isWelcomeModalOpen) && (
        <WelcomeModal
          onClose={() => {
            setIsWelcomeModalOpen(false);
          }}
        />
      )}
      <HeaderBar
        onClickMenuButton={() => {
          setShowLeftPanel(!showLeftPanel);
        }}
      />

      <SearchBar isFetching={preprints.loading} />

      <div className="home__main">
        <LeftSidePanel
          visible={showLeftPanel}
          onClickOutside={() => {
            setShowLeftPanel(false);
          }}
        >
          <Facets
            counts={
              preprints.loading || preprints.search !== apiQs
                ? undefined
                : preprints.counts
            }
            ranges={
              preprints.loading || preprints.search !== apiQs
                ? undefined
                : preprints.ranges
            }
            isFetching={preprints.loading || preprints.search !== apiQs}
          />
        </LeftSidePanel>

        <div className="home__content">
          <div className="home__content-header">
            <h3 className="home__content-title">
              Preprints with reviews or requests for reviews
            </h3>
            <AddButton
              onClick={() => {
                if (user) {
                  history.push('/new');
                } else {
                  setLoginModalOpenNext('/new');
                }
              }}
              disabled={location.pathname === '/new'}
            />
          </div>

          <PrivateRoute path="/new" exact={true}>
            <Modal
              showCloseButton={true}
              title="Add Entry"
              onClose={() => {
                history.push('/');
              }}
            >
              <Helmet>
                <title>Rapid PREreview • Add entry</title>
              </Helmet>
              <NewPreprint
                user={user}
                onCancel={() => {
                  history.push('/');
                }}
                onSuccess={preprint => {
                  history.push('/');
                  setNewPreprints(newPreprints.concat(preprint));
                }}
                onViewInContext={({ preprint, tab }) => {
                  history.push(
                    `/${unprefix(preprint.doi || preprint.arXivId)}`,
                    {
                      preprint: omit(preprint, ['potentialAction']),
                      tab,
                    }, // #FIXME, do we need omit?
                  );
                }}
              />
            </Modal>
          </PrivateRoute>

          {loginModalOpenNext && (
            <LoginRequiredModal
              next={loginModalOpenNext}
              onClose={() => {
                setLoginModalOpenNext(null);
              }}
            />
          )}

          <SortOptions
            value={params.get('sort') || 'score'}
            onMouseEnterSortOption={sortOption => {
              setHoveredSortOption(sortOption);
            }}
            onMouseLeaveSortOption={() => {
              setHoveredSortOption(null);
            }}
            onChange={(
              nextSortOption, // `score` | `new` | `date`
            ) => {
              const search = createPreprintQs(
                { sort: nextSortOption },
                location.search,
              );
              history.push({
                pathname: location.pathame,
                search,
              });
            }}
          />

          {newPreprints.length > 0 && (
            <ul className="home__preprint-list home__preprint-list--new">
              {newPreprints.map(preprint => (
                <li key={getId(preprint)} className="home__preprint-list__item">
                  <PreprintCard
                    isNew={true}
                    user={user}
                    preprint={preprint}
                    onNewRequest={handleNewRequest}
                    onNew={handleNew}
                    onNewReview={handleNewReview}
                    hoveredSortOption={hoveredSortOption}
                    sortOption={params.get('sort') || 'score'}
                  />
                </li>
              ))}
            </ul>
          )}

          {preprints.total_rows === 0 && !preprints.loading ? (
            <div>
              No preprints about this topic have been added to Rapid PREreview.{' '}
              {!!location.search && (
                <XLink to={location.pathname} href={location.pathname}>
                  Clear search terms.
                </XLink>
              )}
            </div>
          ) : preprints.bookmark ===
            (location.state && location.state.bookmark) ? (
            <div>No more results.</div>
          ) : (
            <ul className="home__preprint-list">
              {preprints.rows.map(row => (
                <li key={row.id} className="home__preprint-list__item">
                  <PreprintCard
                    isNew={false}
                    user={user}
                    preprint={row.doc}
                    onNewRequest={handleNewRequest}
                    onNew={handleNew}
                    onNewReview={handleNewReview}
                    hoveredSortOption={hoveredSortOption}
                    sortOption={params.get('sort') || 'score'}
                  />
                </li>
              ))}
            </ul>
          )}

          <div className="home__pagination">
            {!!(location.state && location.state.bookmark) && (
              <Button
                onClick={() => {
                  history.push({
                    pathname: location.pathname,
                    search: createPreprintQs(
                      { text: params.get('q') },
                      location.search,
                    ),
                  });
                }}
              >
                <MdFirstPage /> First page
              </Button>
            )}
            {/* Cloudant returns the same bookmark when it hits the end of the list */}
            {!!(
              preprints.rows.length < preprints.total_rows &&
              preprints.bookmark !== (location.state && location.state.bookmark)
            ) && (
              <Button
                className="home__next-page-button"
                onClick={() => {
                  history.push({
                    pathname: location.pathname,
                    search: createPreprintQs(
                      { text: params.get('q') },
                      location.search,
                    ),
                    state: { bookmark: preprints.bookmark },
                  });
                }}
              >
                Next Page <MdChevronRight />
              </Button>
            )}
          </div>
        </div>

        <div className="home__main__right" />
      </div>
    </div>
  );
}
