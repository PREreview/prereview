// base imports
import React, { Suspense, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MuiSearchBar from 'material-ui-search-bar';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import { useGetCommunity, useGetPreprints } from '../hooks/api-hooks.tsx';

// components
import AddButton from './add-button';
import HeaderBar from './header-bar';
import Loading from './loading';
import NotFound from './not-found';
import SearchBar from './search-bar';
import SortOptions from './sort-options';
import PreprintCard from './preprint-card';
import LoginRequiredModal from './login-required-modal';

// Material-ui components
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Pagination from '@material-ui/lab/Pagination';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles(theme => ({
  avatar: {
    width: theme.spacing(10),
    height: theme.spacing(10),
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: theme.spacing(2),
  },
  banner: {
    maxWidth: theme.breakpoints.values['md'],
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingTop: theme.spacing(12),
    paddingBottom: theme.spacing(8),
    textAlign: 'center',
    [theme.breakpoints.up('lg')]: {
      paddingTop: theme.spacing(16),
      paddingBottom: theme.spacing(8),
      textAlign: 'left',
    },
  },
  contentMain: {
    marginTop: '2rem',
    padding: theme.spacing(2),
  },
  paper: {
    borderRadius: 20,
    boxShadow: '1px 1px 5px 3px #DADADA',
    maxWidth: theme.breakpoints.values['md'],
    marginLeft: 'auto',
    marginRight: 'auto',
    [theme.breakpoints.up('lg')]: {
      textAlign: 'left',
    },
  },
  search: {
    borderRadius: 24,
    paddingLeft: 10,
    paddingRight: 10,
  },
  select: {
    minWidth: 200,
  },
  sidebarBox: {
    maxWidth: theme.breakpoints.values['md'],
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingTop: theme.spacing(12),
    paddingBottom: theme.spacing(8),
    textAlign: 'center',
    [theme.breakpoints.up('lg')]: {
      paddingTop: theme.spacing(16),
      paddingBottom: theme.spacing(16),
      textAlign: 'left',
    },
  },
}));

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
    } else if (key.toLowerCase() === 'sort') {
      processed.append('sort', value);
    } else if (key.toLowerCase() === 'asc') {
      processed.append('asc', value === 'true');
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

export default function Community() {
  const location = useLocation();
  const params = processParams(location.search);
  const [user] = useContext(UserProvider.context);

  const { id } = useParams();
  const { data: community, loading, error } = useGetCommunity({
    resolve: community => {
      if (
        community &&
        community.data &&
        Array.isArray(community.data) &&
        community.data.length > 0
      ) {
        return community.data[0];
      }
    },
    id: id,
  });

  if (loading) {
    return <Loading />;
  } else if (error) {
    return <NotFound />;
  } else {
    return (
      <div className="community">
        <Helmet>
          <title>{community.name}</title>
        </Helmet>

        <HeaderBar thisUser={user} />

        <React.Fragment>
          <CommunityHeader
            name={community.name}
            description={community.description}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <CommunityContent
                thisUser={user}
                community={community}
                params={params}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              {community.members &&
                Array.isArray(community.members) &&
                community.members.length > 0 && (
                  <CommunityPersonas
                    title="Members"
                    personas={community.members}
                    isSearchable="true"
                  />
                )}
              {community.owners &&
                Array.isArray(community.owners) &&
                community.owners.length > 0 && (
                  <CommunityPersonas
                    title="Moderators"
                    personas={community.owners.map(
                      owner => owner.defaultPersona,
                    )}
                    isSearchable="false"
                  />
                )}
            </Grid>
          </Grid>
        </React.Fragment>
      </div>
    );
  }
}

function CommunityHeader({ name, description }) {
  const classes = useStyles();

  return (
    <section>
      <Container maxWidth="lg">
        <Grid container>
          <Grid item xs={12} lg={6}>
            <Box className={classes.banner}>
              <Typography variant="h3" component="h2" gutterBottom={true}>
                {name}
              </Typography>
              <Typography variant="h5" color="textSecondary" paragraph>
                {description}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </section>
  );
}

function CommunityPersonas({ title, personas, isSearchable = false }) {
  const classes = useStyles();

  return (
    <section>
      <Container maxWidth="md">
        <Box pt={8} pb={12} textAlign="center">
          <Box mb={8}>
            <Typography variant="h4" component="h2" gutterBottom={true}>
              {title}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" />
          </Box>
          <Grid container spacing={8}>
            {personas.map(persona => {
              return (
                <Grid key={persona.uuid} item xs={6} md={3}>
                  <Avatar
                    alt={persona.name}
                    src={persona.avatar}
                    className={classes.avatar}
                  />
                  <Typography variant="h6" component="h4" gutterBottom={true}>
                    {persona.name}
                  </Typography>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Container>
    </section>
  );
}

function CommunityContent({ thisUser, community, params }) {
  const classes = useStyles();
  const history = useHistory();
  const [search, setSearch] = useState(params.get('search') || '');
  const [loginModalOpenNext, setLoginModalOpenNext] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  const { data: preprints, loading: loadingPreprints, error } = useGetPreprints(
    {
      queryParams: { ...searchParamsToObject(params), communities: community.uuid, tags: selectedTags.toString() },
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
    return <div>An error occurred: {error}</div>;
  } else {
    return (
      <Box m={2}>
        <CommunitySearch
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
        {loginModalOpenNext && (
          <LoginRequiredModal
            next={loginModalOpenNext}
            onClose={() => {
              setLoginModalOpenNext(null);
            }}
          />
        )}
        <Paper className={`${classes.contentMain} ${classes.paper}`}>
          <Box mb={4}>
            <Grid container justify="space-between">
              <Grid item xs={12} sm={6}>
                <Typography
                  component="h3"
                  variant="h6"
                  align="left"
                  gutterBottom
                >
                  Preprints with reviews or requests for reviews
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box align="right">
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
                </Box>
              </Grid>
            </Grid>
          </Box>
          <Grid className={classes.formControl} container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <InputLabel id="community-tags-label">Tags</InputLabel>
              <Select
                labelId="community-tags-label"
                id="community-tags"
                className={classes.select}
                multiple
                value={selectedTags}
                onChange={ev => setSelectedTags(ev.target.value)}
                input={<Input id="community-tags-select-multiple" />}
                renderValue={selected => (
                  <div className={classes.chips}>
                    {selected.map(value => (
                      <Chip
                        key={value}
                        label={value}
                        className={classes.chip}
                      />
                    ))}
                  </div>
                )}
              >
                {community.tags.map(tag => (
                  <MenuItem key={tag.uuid} value={tag.name}>
                    {tag.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
          <Box mt={4}>
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
            {preprints && preprints.totalCount === 0 && !loadingPreprints ? (
              <div>No preprints have been added to this community.</div>
            ) : (
              preprints &&
              preprints.data.map(row => (
                <Grid item key={row.id}>
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
                </Grid>
              ))
            )}
            {preprints && preprints.totalCount > params.get('limit') && (
              <Grid item>
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
              </Grid>
            )}
          </Box>
        </Paper>
      </Box>
    );
  }
}

function CommunitySearch({
  isFetching,
  defaultValue,
  onChange,
  onCancelSearch,
  onRequestSearch,
}) {
  const classes = useStyles();

  return (
    <Box mb={1}>
      <MuiSearchBar
        value={defaultValue}
        onChange={value => onChange(value)}
        onCancelSearch={onCancelSearch}
        onRequestSearch={onRequestSearch}
        className={classes.search}
        placeholder={'Search by DOI, arXiv ID, title, author, or abstract'}
        disabled={isFetching}
      />
    </Box>
  );
}

CommunitySearch.propTypes = {
  isFetching: PropTypes.bool,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  onRequestSearch: PropTypes.func,
  onCancelSearch: PropTypes.func,
};
