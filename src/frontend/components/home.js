// base imports
import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Material UI
import Pagination from '@material-ui/lab/Pagination';

// contexts
import { UserContext } from '../contexts/user-context';

// hooks
import { useGetPreprints } from '../hooks/api-hooks.tsx';
import {
  useIsNewVisitor,
  useIsMobile,
  useNewPreprints,
} from '../hooks/ui-hooks';

// utils
import { createPreprintId } from '../../common/utils/ids.js';
import { getId } from '../utils/jsonld';

// components
import AddButton from './add-button';
import HeaderBar from './header-bar';
import Loading from './loading';
import LoginRequiredModal from './login-required-modal';
import Modal from './modal';
import NewPreprint from './new-preprint';
import PreprintCard from './preprint-card';
import PrivateRoute from './private-route';
import SearchBar from './search-bar';
import SortOptions from './sort-options';
import WelcomeModal from './welcome-modal';
import XLink from './xlink';

// constants
import { ORG } from '../constants';

const processParams = search => {
  const unprocessed = new URLSearchParams(search);
  const processed = new URLSearchParams();
  let page = 1;
  let limit = 10;
  for (const [key, value] of unprocessed) {
    if (key.toLowerCase() === 'search') {
      processed.append('search', value);
    } else if (key.toLowerCase() === 'page') {
      page = value;
    } else if (key.toLowerCase() === 'limit') {
      limit = value;
    } else if (key.toLowerCase() === 'desc') {
      processed.append('desc', value === 'true');
    }
  }

  processed.append('page', page);
  processed.append('limit', limit);
  processed.append('offset', limit * (page - 1));

  return processed;
};

const searchParamsToObject = params => {
  const obj = {};
  for (const [key, value] of params.entries()) {
    if (key !== 'page') {
      obj[key] = value;
    }
  }
  return obj;
};

export default function Home() {
  const history = useHistory();
  const location = useLocation();
  const params = processParams(location.search);

  const thisUser = useContext(UserContext);
  const isMobile = useIsMobile();
  const [showLeftPanel, setShowLeftPanel] = useState(!isMobile);
  const [loginModalOpenNext, setLoginModalOpenNext] = useState(null);
  const isNewVisitor = useIsNewVisitor();
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(true);
  const [newPreprints, setNewPreprints] = useNewPreprints();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get('search') || '');

  const { data: preprints, loading: loadingPreprints, error } = useGetPreprints(
    {
      queryParams: searchParamsToObject(params),
    },
  );

  const [hoveredSortOption, setHoveredSortOption] = useState(null);

  useEffect(() => {
    if (!loadingPreprints) {
      if (preprints) {
        setLoading(false);
      }
    }
  }, []);

  const handleNewReview = preprintId => {
    if (thisUser) {
      history.push(`/preprints/${preprintId}`, {
        tab: 'reviews',
        isSingleStep: true,
      });
    } else {
      setLoginModalOpenNext(`/preprints/${preprintId}`);
    }
  };

  const handleNewRequest = preprintId => {
    if (thisUser) {
      history.push(`/preprints/${preprintId}`, {
        tab: 'request',
        isSingleStep: true,
      });
    } else {
      setLoginModalOpenNext(`/preprints/${preprintId}`);
    }
  };

  const handleNew = preprintId => {
    if (thisUser) {
      history.push(`/preprints/${preprintId}`);
    } else {
      setLoginModalOpenNext(`/preprints/${preprintId}`);
    }
  };

  if (loadingPreprints) {
    return <Loading />;
  } else if (error) {
    return <div>An error occurred: {error}</div>;
  } else {
    return (
      <div className="home">
        <Helmet>
          <title>{ORG} • Home</title>
        </Helmet>

        {!!((isNewVisitor || params.get('welcome')) && isWelcomeModalOpen) && (
          <WelcomeModal
            onClose={() => {
              setIsWelcomeModalOpen(false);
            }}
          />
        )}
        <HeaderBar
          thisUser={thisUser}
          onClickMenuButton={() => {
            setShowLeftPanel(!showLeftPanel);
          }}
        />

        <SearchBar
          defaultValue={search}
          isFetching={loadingPreprints}
          onChange={value => setSearch(value)}
          onCancelSearch={() => {
            params.delete('search');
            setSearch('');
            history.push({
              pathname: location.pathame,
              search: params.toString(),
            });
          }}
          onRequestSearch={() => {
            params.set('search', search);
            history.push({
              pathname: location.pathame,
              search: params.toString(),
            });
          }}
        />

        <div className="home__main">
          <div className="home__content">
            <div className="home__content-header">
              <h3 className="home__content-title">
                Preprints with reviews or requests for reviews
              </h3>
              <AddButton
                onClick={() => {
                  if (thisUser) {
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
                  user={thisUser}
                  onCancel={() => {
                    history.push('/');
                  }}
                  onSuccess={preprint => {
                    history.push('/');
                    setNewPreprints(newPreprints.concat(preprint));
                  }}
                  onViewInContext={({ preprint, tab }) => {
                    history.push(
                      `/preprints/${createPreprintId(preprint.handle)}`,
                      {
                        preprint: preprint,
                        tab,
                      },
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
              sort={params.get('sort') || ''}
              order={params.get('desc') === 'true' ? 'desc' : 'asc'}
              onMouseEnterSortOption={sortOption => {
                setHoveredSortOption(sortOption);
              }}
              onMouseLeaveSortOption={() => {
                setHoveredSortOption(null);
              }}
              onChange={(
                sortOption,
                sortOrder
              ) => {
                params.set('desc', sortOrder === 'desc');
                history.push({
                  pathname: location.pathame,
                  search: params.toString(),
                });
              }}
            />

            {newPreprints.length > 0 && (
              <ul className="home__preprint-list home__preprint-list--new">
                {newPreprints.map(preprint => (
                  <li
                    key={getId(preprint)}
                    className="home__preprint-list__item"
                  >
                    <PreprintCard
                      isNew={true}
                      preprint={preprint}
                      onNewRequest={handleNewRequest}
                      onNew={handleNew}
                      onNewReview={handleNewReview}
                      hoveredSortOption={hoveredSortOption}
                      sortOption={params.get('desc') === 'true'}
                    />
                  </li>
                ))}
              </ul>
            )}
            {preprints && preprints.length === 0 && !loading ? (
              <div>
                No preprints about this topic have been added to Rapid
                PREreview.{' '}
                {!!location.search && (
                  <XLink to={location.pathname} href={location.pathname}>
                    Clear search terms.
                  </XLink>
                )}
              </div>
            ) : preprints.length <= 0 ? (
              <div>No more results.</div>
            ) : (
              <ul className="home__preprint-list">
                {preprints &&
                  preprints.data.map(row => (
                    <li key={row.id} className="home__preprint-list__item">
                      <PreprintCard
                        isNew={false}
                        user={thisUser}
                        preprint={row}
                        onNewRequest={handleNewRequest}
                        onNew={handleNew}
                        onNewReview={handleNewReview}
                        hoveredSortOption={hoveredSortOption}
                        sortOption={params.get('desc') === 'true'}
                      />
                    </li>
                  ))}
              </ul>
            )}

            <div className="home__pagination">
              <Pagination
                count={Math.ceil((preprints.totalCount / params.get('limit')))}
                page={parseInt("" + params.get('page'))}
                onChange={(ev, page) => {
                  params.set('page', page);
                  history.push({
                    pathname: location.pathname,
                    search: params.toString()
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
