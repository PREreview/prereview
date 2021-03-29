// base imports
import React, { useContext, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Material UI imports
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Pagination from '@material-ui/lab/Pagination';
import Typography from '@material-ui/core/Typography';

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
import { processParams, searchParamsToObject } from '../utils/search';

// components
import AddButton from './add-button';
import Footer from './footer';
import HeaderBar from './header-bar';
import Loading from './loading';
import LoginRequiredModal from './login-required-modal';
import NewPreprint from './new-preprint';
import NotFound from './not-found';
import PreprintCard from './preprint-card';
import PrivateRoute from './private-route';
import SearchBar from './search-bar';
import SortOptions from './sort-options';
import WelcomeModal from './welcome-modal';

// constants
import { ORG } from '../constants';

const useStyles = makeStyles(theme => ({
  link: {
    color: `${theme.palette.primary.main} !important`,
  },
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

export default function Reviews() {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const params = processParams(location.search);

  const [thisUser] = useContext(UserProvider.context);
  const isMobile = useIsMobile();
  const [showLeftPanel, setShowLeftPanel] = useState(!isMobile);
  const [loginModalOpenNext, setLoginModalOpenNext] = useState(null);
  const [newPreprintOpen, setNewPreprintOpen] = useState(false);
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
    return <NotFound />;
  } else {
    return (
      <div className="home">
        <Helmet>
          <title>Reviews • {ORG}</title>
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

        <Box py={8}>
          <Container>
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
            <Box my={4}>
              <Grid
                container
                alignItems="flex-start"
                justify="space-between"
                spacing={2}
              >
                <Grid item>
                  <Typography component="h2" variant="h2">
                    Preprints with reviews or requests for reviews
                  </Typography>
                </Grid>
                <Grid item>
                  <AddButton
                    onClick={() => {
                      if (thisUser) {
                        setNewPreprintOpen(true);
                        history.push('/new');
                      } else {
                        setLoginModalOpenNext('/new');
                      }
                    }}
                    disabled={location.pathname === '/new'}
                  />
                  <PrivateRoute path="/new" exact={true}>
                    <Dialog
                      open={newPreprintOpen}
                      onClose={() => {
                        history.push('/reviews');
                      }}
                    >
                      <Helmet>
                        <title>Rapid PREreview • Add entry</title>
                      </Helmet>
                      <NewPreprint
                        user={thisUser}
                        onCancel={() => {
                          history.push('/reviews');
                        }}
                        onSuccess={preprint => {
                          history.push('/reviews');
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
                    </Dialog>
                  </PrivateRoute>
                  {loginModalOpenNext && (
                    <LoginRequiredModal
                      open={loginModalOpenNext}
                      onClose={() => {
                        setLoginModalOpenNext(null);
                      }}
                    />
                  )}
                </Grid>
              </Grid>
            </Box>

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
              <List>
                {newPreprints.map(preprint => (
                  <ListItem key={preprint.uuid} className={classes.listItem}>
                    <PreprintCard
                      isNew={true}
                      preprint={preprint}
                      onNewRequest={handleNewRequest}
                      onNew={handleNew}
                      onNewReview={handleNewReview}
                      hoveredSortOption={hoveredSortOption}
                      sortOption={params.get('asc') === 'true'}
                    />
                  </ListItem>
                ))}
              </List>
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
          </Container>
        </Box>
        <Footer />
      </div>
    );
  }
}
