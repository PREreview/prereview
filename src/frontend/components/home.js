// base imports
import React, { useContext, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Material UI
import Link from '@material-ui/core/Link';
import Pagination from '@material-ui/lab/Pagination';

// contexts
import UserProvider from '../contexts/user-context';

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
import { processParams, searchParamsToObject } from '../utils/search';

// components
import AddButton from './add-button';
import Banner from './banner';
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

// constants
import { ORG } from '../constants';

export default function Home() {
  const history = useHistory();
  const location = useLocation();
  const params = processParams(location.search);

  const [thisUser] = useContext(UserProvider.context);
  const isMobile = useIsMobile();
  const [showLeftPanel, setShowLeftPanel] = useState(!isMobile);
  const [loginModalOpenNext, setLoginModalOpenNext] = useState(null);
  const isNewVisitor = useIsNewVisitor();
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(true);
  const [newPreprints, setNewPreprints] = useNewPreprints();

  const [search, setSearch] = useState(params.get('search') || '');

  const { data: preprints, loading: loadingPreprints, error } = useGetPreprints(
    {
      queryParams: searchParamsToObject(params),
    },
  );

  const [hoveredSortOption, setHoveredSortOption] = useState(null);

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
    return <div>An error occurred: {error.message}</div>;
  } else {
    return (
      <div className="home">
        <Helmet>
          <title>Home • {ORG}</title>
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
          thisUser={thisUser}
          onClickMenuButton={() => {
            setShowLeftPanel(!showLeftPanel);
          }}
        />

        <div className="fixed__search-bar">
          <SearchBar
            defaultValue={search}
            isFetching={loadingPreprints}
            onChange={value => {
              params.delete('page');
              setSearch(value);
            }}
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
              params.delete('page');
              history.push({
                pathname: location.pathame,
                search: params.toString(),
              });
            }}
          />
        </div>

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
            {preprints && preprints.totalCount > 0 && !loadingPreprints && (
              <SortOptions
                sort={params.get('sort') || ''}
                order={params.get('asc') === 'true' ? 'asc' : 'desc'}
                onMouseEnterSortOption={sortOption => {
                  setHoveredSortOption(sortOption);
                }}
                onMouseLeaveSortOption={() => {
                  setHoveredSortOption(null);
                }}
                onChange={(sortOption, sortOrder) => {
                  params.set('asc', sortOrder === 'asc');
                  params.set('sort', sortOption);
                  history.push({
                    pathname: location.pathame,
                    search: params.toString(),
                  });
                }}
              />
            )}

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
                      sortOption={params.get('asc') === 'true'}
                    />
                  </li>
                ))}
              </ul>
            )}
            {!preprints ||
            (preprints && preprints.totalCount <= 0 && !loadingPreprints) ? (
              <div>
                No preprints about this topic have been added to Rapid
                PREreview.{' '}
                <Link
                  onClick={() => {
                    setSearch('');
                    if (thisUser) {
                      history.push('/new');
                    } else {
                      setLoginModalOpenNext('/new');
                    }
                  }}
                >
                  Review or request a review of a Preprint to add it to the
                  site.
                </Link>
              </div>
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
                        sortOption={params.get('asc') === 'true'}
                      />
                    </li>
                  ))}
              </ul>
            )}

            {preprints && preprints.totalCount > params.get('limit') && (
              <div className="home__pagination">
                <Pagination
                  count={Math.ceil(preprints.totalCount / params.get('limit'))}
                  page={parseInt('' + params.get('page'))}
                  onChange={(ev, page) => {
                    params.set('page', page);
                    history.push({
                      pathname: location.pathname,
                      search: params.toString(),
                    });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
