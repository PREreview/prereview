// base imports
import React, { useContext, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';
import Tooltip from '@reach/tooltip';

// Material UI imports
import { makeStyles } from '@material-ui/core/styles';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import MenuItem from '@material-ui/core/MenuItem';
import Pagination from '@material-ui/lab/Pagination';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import {
  useGetCommunities,
  useGetPreprints,
  useGetTags,
} from '../hooks/api-hooks.tsx';
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
//import SortOptions from './sort-options';
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
  sortOptions: {
    alignItems: 'center',
    borderBottom: '1px',
    textTransform: 'uppercase',
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

  const tagsParam = params.get('tags') || [];
  const [selectedTags, setSelectedTags] = useState(
    Array.isArray(tagsParam) ? tagsParam : [tagsParam],
  );

  const communitiesParam = params.get('communities') || [];
  const [selectedCommunities, setSelectedCommunities] = useState(
    Array.isArray(communitiesParam) ? communitiesParam : [communitiesParam],
  );

  const {
    data: preprints,
    loading: loadingPreprints,
    error: preprintError,
  } = useGetPreprints({
    queryParams: searchParamsToObject(params),
  });

  const {
    data: communities,
    loading: loadingCommunities,
    error: communityError,
  } = useGetCommunities({
    resolve: communities => {
      if (communities.data && Array.isArray(communities.data)) {
        return communities.data;
      }
    },
  });

  const { data: tags, loading: loadingTags, error: tagError } = useGetTags({
    resolve: tags => {
      if (tags.data && Array.isArray(tags.data)) {
        return tags.data;
      }
    },
  });

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

  if (loadingPreprints || loadingTags || loadingCommunities) {
    return <Loading />;
  } else if (preprintError || tagError || communityError) {
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
                {preprints ? (
                  <Grid item>
                    <Typography component="h4" variant="h4">
                      {preprints.totalCount} preprints with{' '}
                      {preprints.totalFull} reviews, {preprints.totalRapid}{' '}
                      rapid reviews, and {preprints.totalRequests} requests for
                      reviews
                    </Typography>
                  </Grid>
                ) : null}
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

            {(preprints && preprints.totalCount > 0) ||
            params.has('tags') ||
            params.has('communities') ? (
              <Grid
                container
                spacing={2}
                alignItems="center"
                justify="flex-start"
              >
                {preprints ? (
                  <Grid item className={classes.formControl} xs={12} sm={2}>
                    <Typography component="p" variant="h5">
                      Filter by:
                    </Typography>
                  </Grid>
                ) : null}
                {tags && Array.isArray(tags) && tags.length > 0 ? (
                  <Grid
                    container
                    item
                    spacing={1}
                    className={classes.formControl}
                    alignItems="center"
                    xs={12}
                    sm={4}
                  >
                    <Grid item>
                      <InputLabel htmlFor="personas-tags">Tags</InputLabel>
                    </Grid>
                    <Grid item>
                      <Select
                        id="personas-tags"
                        className={classes.select}
                        multiple
                        value={selectedTags}
                        onChange={ev => {
                          params.delete('tags');
                          setSelectedTags(ev.target.value);
                          if (
                            Array.isArray(ev.target.value) &&
                            ev.target.value.length > 0
                          ) {
                            params.set('tags', ev.target.value.toString());
                          }
                          history.push({
                            pathname: location.pathame,
                            search: params.toString(),
                          });
                        }}
                        input={<Input id="personas-tags-select-multiple" />}
                        renderValue={() => (
                          <div className={classes.chips}>
                            {selectedTags.map(value => (
                              <Chip
                                key={value}
                                label={value}
                                className={classes.chip}
                              />
                            ))}
                          </div>
                        )}
                      >
                        {tags.map(tag => (
                          <MenuItem key={tag.uuid} value={tag.name}>
                            {tag.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </Grid>
                  </Grid>
                ) : null}
                {communities &&
                Array.isArray(communities) &&
                communities.length > 0 ? (
                  <Grid
                    container
                    item
                    spacing={1}
                    className={classes.formControl}
                    alignItems="center"
                    xs={12}
                    sm={4}
                  >
                    <Grid item>
                      <InputLabel id="personas-communities-label">
                        Communities
                      </InputLabel>
                    </Grid>
                    <Grid item>
                      <Select
                        labelId="personas-communities-label"
                        id="personas-communities"
                        className={classes.select}
                        multiple
                        value={selectedCommunities}
                        onChange={ev => {
                          params.delete('communities');
                          setSelectedCommunities(ev.target.value);
                          if (
                            Array.isArray(ev.target.value) &&
                            ev.target.value.length > 0
                          ) {
                            params.set(
                              'communities',
                              ev.target.value.toString(),
                            );
                          }
                          history.push({
                            pathname: location.pathame,
                            search: params.toString(),
                          });
                        }}
                        input={
                          <Input id="personas-communities-select-multiple" />
                        }
                        renderValue={() => (
                          <div className={classes.chips}>
                            {selectedCommunities.map(value => (
                              <Chip
                                key={value}
                                label={value}
                                className={classes.chip}
                              />
                            ))}
                          </div>
                        )}
                      >
                        {communities.map(community => (
                          <MenuItem key={community.uuid} value={community.name}>
                            {community.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </Grid>
                  </Grid>
                ) : null}
              </Grid>
            ) : null}

            {preprints && preprints.totalCount > 0 && !loadingPreprints && (
              <Box mt={3} pt={3} borderTop="1px solid #ccc">
                <Grid
                  container
                  spacing={2}
                  alignItems="baseline"
                  justify="flex-start"
                >
                  <Grid item xs={12} sm={1}>
                    <Typography component="p" variant="h5">
                      Sort by:
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={11}>
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
                  </Grid>
                </Grid>
              </Box>
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
                <Typography>
                  No preprints about this topic have been added to PREreview.{' '}
                  <Link
                    onClick={() => {
                      setSearch('');
                      if (thisUser) {
                        history.push('/reviews/new');
                      } else {
                        setLoginModalOpenNext('/reviews');
                      }
                    }}
                  >
                    Review or request a review of a preprint to add it to the
                    platform.
                  </Link>
                </Typography>
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

function SortOptions({ sort, order, onChange }) {
  const classes = useStyles();
  const isMobile = useIsMobile();

  return (
    <Grid container item className={classes.sortOptions} alignItems="center">
      {['recentRapid', 'recentFull', 'recentRequests', 'datePosted'].map(
        name => (
          <Grid container item xs key={name}>
            <Box display="none">
              <Input
                type="radio"
                id={`sort-options-${name}`}
                name={name}
                value={name}
                display="none"
                onClick={e => {
                  const sortOption = e.target.value;
                  onChange(sortOption, order === 'asc' ? 'desc' : 'asc');
                }}
              />
            </Box>
            <Grid item>
              <Tooltip
                label={`Sort by ${
                  name === 'recentRapid'
                    ? 'Date of latest Rapid Review'
                    : name === 'recentFull'
                    ? 'Date of latest Full Review'
                    : name === 'recentRequests'
                    ? 'Date of latest request for review'
                    : 'date posted on preprint server'
                }`}
              >
                <InputLabel
                  htmlFor={`sort-options-${name}`}
                  cursor={sort === name ? 'default' : 'pointer'}
                  focus={sort === name}
                >
                  {name === 'recentRapid'
                    ? isMobile
                      ? 'Rapid Reviewed'
                      : 'Recently Rapid Reviewed'
                    : name === 'recentFull'
                    ? isMobile
                      ? 'Reviewed'
                      : 'Recently Reviewed'
                    : name === 'recentRequests'
                    ? isMobile
                      ? 'Requested'
                      : 'Recently Requested'
                    : isMobile
                    ? 'Published'
                    : 'Date Published'}
                </InputLabel>
              </Tooltip>
            </Grid>
            <Grid item>
              {order === 'asc' ? (
                <ArrowUpwardIcon
                  visibility={sort === name ? 'visible' : 'hidden'}
                />
              ) : (
                <ArrowDownwardIcon
                  visibility={sort === name ? 'visible' : 'hidden'}
                />
              )}
            </Grid>
          </Grid>
        ),
      )}
    </Grid>
  );
}

SortOptions.propTypes = {
  onChange: PropTypes.func.isRequired,
  sort: PropTypes.oneOf([
    'recentRapid',
    'recentFull',
    'recentRequests',
    'datePosted',
    '',
  ]),
  order: PropTypes.string,
};
