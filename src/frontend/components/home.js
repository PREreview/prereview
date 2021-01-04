import React, { useContext, useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import omit from 'lodash/omit';
import { MdChevronRight, MdFirstPage } from 'react-icons/md';
import PrivateRoute from './private-route';
import { UserContext } from '../contexts/user-context';
import { useGetPreprints } from '../hooks/api-hooks.tsx';
import {
  useIsNewVisitor,
  useIsMobile,
  useNewPreprints,
} from '../hooks/ui-hooks';
import { getId } from '../utils/jsonld';
import HeaderBar from './header-bar';
import SearchBar from './search-bar';
import PreprintCard from './preprint-card';
import SortOptions from './sort-options';
import NewPreprint from './new-preprint';
import Modal from './modal';
import Button from './button';
import LoginRequiredModal from './login-required-modal';
import { createPreprintQs } from '../utils/search';
import WelcomeModal from './welcome-modal';
import XLink from './xlink';
import AddButton from './add-button';
import { ORG } from '../constants';
import Banner from './banner';
import { createPreprintId } from '../../common/utils/ids.js'

// Material UI
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

// icons
import PreReviewLogo from './pre-review-logo';

const searchParamsToObject = params => {
  const obj = {};
  for (const [key, value] of params) {
    obj[key] = value;
  }
  return obj;
};

const useStyles = makeStyles((theme) => ({
  root: {
    left: '50%',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
  },
  spinning: {
    color: '#ff3333',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 30,
  },
}));

export default function Home() {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const thisUser = useContext(UserContext);
  const isMobile = useIsMobile();
  const [showLeftPanel, setShowLeftPanel] = useState(!isMobile);
  const [loginModalOpenNext, setLoginModalOpenNext] = useState(null);
  const isNewVisitor = useIsNewVisitor();
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(true);
  const [newPreprints, setNewPreprints] = useNewPreprints();

  const [loading, setLoading] = useState(true);

  const { data: preprints, loading: loadingPreprints, error } = useGetPreprints({
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

  const handleNewReview = useCallback(
    preprint => {
      if (thisUser) {
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
    [thisUser, history],
  );

  const handleNewRequest = useCallback(
    preprint => {
      if (thisUser) {
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
    [thisUser, history],
  );

  const handleNew = useCallback(
    preprint => {
      if (thisUser) {
        history.push('/new', {
          preprint: omit(preprint, ['potentialAction']), // #FIXME, do we need omit?
        });
      } else {
        setLoginModalOpenNext(
          `/new?identifier=${preprint.doi || preprint.arXivId}`,
        );
      }
    },
    [thisUser, history],
  );

  if (loadingPreprints) {
    return (
      <div className={classes.root}>
        <PreReviewLogo />
        <CircularProgress className={classes.spinning} size={60} />
      </div>
    );
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

        <SearchBar isFetching={loadingPreprints} />

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
                      sortOption={params.get('sort') || 'score'}
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
              {preprints && preprints.length > 0 && (
                <Button
                  className="home__next-page-button"
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
                  Next Page <MdChevronRight />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
