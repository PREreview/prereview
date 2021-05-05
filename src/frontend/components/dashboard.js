// base imports
import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { subDays } from 'date-fns';
import { useHistory, useLocation } from 'react-router-dom';

// utils
import { createPreprintId } from '../../common/utils/ids.js';

import { ORG } from '../constants';

// hooks
import { useGetPreprints } from '../hooks/api-hooks.tsx';
import { useNewPreprints } from '../hooks/ui-hooks';

// utils
import { getUsersRank } from '../utils/stats';
import { processParams, searchParamsToObject } from '../utils/search';

// contexts
import UserProvider from '../contexts/user-context';

// Material UI components
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

// components
import ActiveUser from './active-user';
import AddButton from './add-button';
import LoginRequiredModal from './login-required-modal';
import SortOptions from './sort-options';
import HeaderBar from './header-bar';
import PreprintCard from './preprint-card';
import SearchBar from './search-bar';
import RecentActivity from './recent-activity';
import PrivateRoute from './private-route';
import NewPreprint from './new-preprint';
import Loading from './loading';
import NotFound from './not-found';

const useStyles = makeStyles(theme => ({
  gridItem: {
    borderRadius: 50,
    border: `1px solid ${theme.palette.secondary.light}`,
  },
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

export default function Dashboard() {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [user] = useContext(UserProvider.context);

  const [loginModalOpenNext, setLoginModalOpenNext] = useState(null);
  const [newPreprintOpen, setNewPreprintOpen] = useState(false);
  const [newPreprints, setNewPreprints] = useNewPreprints();

  // search
  const params = processParams(location.search);
  const [search, setSearch] = useState(params.get('search') || '');

  const { data: preprints, loading: loadingPreprints, error } = useGetPreprints(
    {
      queryParams: {
        ...searchParamsToObject(params),
        include_images: 'avatar',
      },
    },
  );

  const [hoveredSortOption, setHoveredSortOption] = useState(null);

  // handle new preprint cases
  const handleNewReview = preprintId => {
    if (user) {
      history.push(`/preprints/${preprintId}`, {
        tab: 'reviews',
        isSingleStep: true,
      });
    } else {
      setLoginModalOpenNext(`/preprints/${preprintId}`);
    }
  };

  const handleNewRequest = preprintId => {
    if (user) {
      history.push(`/preprints/${preprintId}`, {
        tab: 'request',
        isSingleStep: true,
      });
    } else {
      setLoginModalOpenNext(`/preprints/${preprintId}`);
    }
  };

  const handleNew = preprintId => {
    if (user) {
      history.push(`/preprints/${preprintId}`);
    } else {
      setLoginModalOpenNext(`/preprints/${preprintId}`);
    }
  };

  /**
   * this code is a bit clunky and probably expensive
   * */
  let activities = [];
  !loadingPreprints && preprints
    ? preprints.data.map(preprint => {
        preprint.requests.forEach(request =>
          activities.push({
            ...request,
            type: 'request',
            preprintTitle: preprint.title,
            handle: preprint.handle,
          }),
        );
        preprint.rapidReviews.length
          ? preprint.rapidReviews.forEach(rapid =>
              activities.push({
                ...rapid,
                type: 'rapid',
                preprintTitle: preprint.title,
                handle: preprint.handle,
              }),
            )
          : null;
        preprint.fullReviews.length
          ? preprint.fullReviews
              .filter(review => review.isPublished)
              .forEach(review =>
                activities.push({
                  ...review,
                  type: 'long',
                  preprintTitle: preprint.title,
                  handle: preprint.handle,
                }),
              )
          : null;
      })
    : (activities = []);

  // filtering actions for ones that happened within the last week
  const recentActivities = activities
    ? activities.filter(
        activity => new Date(activity.createdAt) >= subDays(new Date(), 7),
      )
    : [];

  // sort recent actions to populate a "Recent activity" section,
  // but sorts all actions if none occurred in the last week
  const sortedActivities = recentActivities.length
    ? recentActivities
        .slice(0, 15)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : activities
    ? activities
        .slice(0, 15)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : null;

  // gets active users, ranked by number of requests+reviews
  // rankedUsers returns an array of objects where
  // the key is the uuid of a user's persona and the
  // value is their number of 'activity'
  const rankedUsers = getUsersRank(activities ? activities : []);

  // gets 10 of the top users, just their user ids
  const activeUsers = rankedUsers.slice(0, 10).map(user => user[0]);

  if (loadingPreprints) {
    return <Loading />;
  } else if (error) {
    return <NotFound />;
  } else {
    return (
      <Box>
        <Helmet>
          <title>{ORG} • Dashboard</title>
        </Helmet>
        <HeaderBar thisUser={user} />
        <Container maxWidth="xl">
          {loginModalOpenNext && (
            <LoginRequiredModal
              open={loginModalOpenNext}
              onClose={() => {
                setLoginModalOpenNext(null);
              }}
            />
          )}
          <PrivateRoute path="/dashboard/new" exact={true}>
            <Dialog
              maxWidth="md"
              open={newPreprintOpen}
              title="Add Entry"
              onClose={() => {
                history.push({
                  pathname: '/dashboard',
                  search: location.search,
                });
              }}
            >
              <Helmet>
                <title>Rapid PREreview • Add entry</title>
              </Helmet>
              <NewPreprint
                user={user}
                onCancel={() => {
                  history.push({
                    pathname: '/dashboard',
                    search: location.search,
                  });
                }}
                onSuccess={preprint => {
                  history.push({
                    pathname: '/dashboard',
                    search: location.search,
                  });
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
          <Box my={6}>
            <Typography
              component="h2"
              variant="h2"
              textalign="center"
              gutterBottom
            >
              COVID-19 Dashboard
            </Typography>
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
            <Box mt={4}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
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
                  {!preprints ||
                  (preprints &&
                    preprints.totalCount <= 0 &&
                    !loadingPreprints) ? (
                    <div>
                      No preprints about this topic have been added to
                      PREreview.{' '}
                      <Link
                        href="/dashboard/new"
                        onClick={() => {
                          setSearch('');
                          if (user) {
                            history.push('/dashboard/new');
                          } else {
                            setLoginModalOpenNext('/dashboard/new');
                          }
                        }}
                      >
                        Review or request a review of a Preprint to add it to
                        the site.
                      </Link>
                    </div>
                  ) : (
                    <List>
                      {preprints &&
                        preprints.data.map(row => (
                          <ListItem key={row.id} className={classes.listItem}>
                            <PreprintCard
                              isNew={false}
                              user={user}
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
                        count={Math.ceil(
                          preprints.totalCount / params.get('limit'),
                        )}
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
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box mb={4}>
                    <AddButton
                      onClick={() => {
                        if (user) {
                          setNewPreprintOpen(true);
                          history.push({
                            pathname: '/dashboard/new',
                            search: location.search,
                          });
                        } else {
                          setLoginModalOpenNext(
                            `/dashboard/new${location.search}`,
                          );
                        }
                      }}
                    />
                  </Box>
                  <Grid container spacing={2} justify="space-between">
                    <Grid item xs={12} md={6} className={classes.gridItem}>
                      <Box m={2}>
                        <Typography component="h3" variant="h3">
                          Recent Activity
                        </Typography>
                        <List>
                          {sortedActivities.map(activity => (
                            <ListItem
                              key={activity.uuid}
                              className={classes.listItem}
                            >
                              <RecentActivity activity={activity} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} className={classes.gridItem}>
                      <Box m={2}>
                        <Typography component="h3" variant="h3">
                          Active Reviewers
                        </Typography>
                        <List>
                          {activeUsers.map(user => (
                            <ListItem
                              key={user.uuid}
                              className={classes.listItem}
                            >
                              <ActiveUser user={user} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }
}
