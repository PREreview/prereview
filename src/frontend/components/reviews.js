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

// icons
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

const useStyles = makeStyles(() => ({
  info: {
    backgroundColor: '#FAB7B7',
  },
  infoIcon: {
    paddingRight: 5,
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
            <Grid container alignItems="center">
              <Grid item>
                <Box mb={5} p={2} className={classes.info}>
                  <Typography component="div" variant="body1">
                    <InfoOutlinedIcon className={classes.infoIcon} />
                    This is a platform for the crowdsourcing of preprint
                    reviews. Use the search bar below to find preprints that
                    already have reviews or requests for reviews. To add your
                    own review or request, use the Add Review | Request Review
                    button, paste the preprint DOI and follow the instructions.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <SearchBar
              defaultValue={search}
              placeholderValue="Search preprints by title, author, abstract, DOI, or arXiv ID"
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
                        history.push('/reviews/new');
                      } else {
                        setLoginModalOpenNext('/reviews/new');
                      }
                    }}
                    disabled={location.pathname === '/reviews/new'}
                  />
                  <PrivateRoute path="/reviews/new" exact={true}>
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
                No preprints about this topic have been added to PREreview.{' '}
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
                  Review or request a review of a preprint to add it to the
                  platform.
                </Link>
              </div>
            ) : (
              <List>
                {preprints &&
                  preprints.data.map(row => (
                    <ListItem key={row.id} className={classes.listItem}>
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
                    </ListItem>
                  ))}
              </List>
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
