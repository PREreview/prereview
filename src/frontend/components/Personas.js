// base imports
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Tooltip from '@reach/tooltip';

// Material UI imports
import { makeStyles } from '@material-ui/core/styles';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
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
  useGetBadges,
  useGetCommunities,
  useGetPersonas,
} from '../hooks/api-hooks.tsx';
import { useIsMobile } from '../hooks/ui-hooks';

// utils
import { processParams, searchParamsToObject } from '../utils/search';

// components
import Footer from './footer';
import HeaderBar from './header-bar';
import Loading from './loading';
import LoginRequiredModal from './login-required-modal';
import NotFound from './not-found';
import PersonaCard from './PersonaCard';
import SearchBar from './search-bar';

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

export default function Personas() {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const params = processParams(location.search);

  const [thisUser] = useContext(UserProvider.context);
  const isMobile = useIsMobile();
  const [showLeftPanel, setShowLeftPanel] = useState(!isMobile);
  const [loginModalOpenNext, setLoginModalOpenNext] = useState(null);

  const [search, setSearch] = useState(params.get('search') || '');

  const badgesParam = params.get('badges') || [];
  const [selectedBadges, setSelectedBadges] = useState(
    Array.isArray(badgesParam) ? badgesParam : [badgesParam],
  );

  const communitiesParam = params.get('communities') || [];
  const [selectedCommunities, setSelectedCommunities] = useState(
    Array.isArray(communitiesParam) ? communitiesParam : [communitiesParam],
  );

  const {
    data: personas,
    loading: loadingPersonas,
    error: personaError,
  } = useGetPersonas({
    queryParams: searchParamsToObject(params),
  });

  const {
    data: badges,
    loading: loadingBadges,
    error: badgeError,
  } = useGetBadges({
    resolve: badges => {
      if (badges.data && Array.isArray(badges.data)) {
        return badges.data;
      }
    },
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

  const [hoveredSortOption, setHoveredSortOption] = useState(null);

  if (loadingPersonas || loadingBadges || loadingCommunities) {
    return <Loading />;
  } else if (personaError || badgeError || communityError) {
    return <NotFound />;
  } else {
    return (
      <div>
        <Helmet>
          <title>PREreview • Search Personas</title>
        </Helmet>

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
              placeholderValue="Search users by name or bio"
              isFetching={loadingPersonas}
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
                    {personas.totalCount} PREreview Members
                  </Typography>
                </Grid>
                <Grid item>
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
            <Grid container spacing={3}>
              <Grid item className={classes.formControl} xs spacing={2}>
                <Typography component="h5" variant="h5">
                  Filter by:
                </Typography>
              </Grid>
              {badges && Array.isArray(badges) && badges.length > 0 ? (
                <Grid item className={classes.formControl} xs>
                  <InputLabel htmlFor="personas-badges">Badges</InputLabel>
                  <Select
                    id="personas-badges"
                    className={classes.select}
                    multiple
                    value={selectedBadges}
                    onChange={ev => {
                      params.delete('badges');
                      setSelectedBadges(ev.target.value);
                      if (
                        Array.isArray(ev.target.value) &&
                        ev.target.value.length > 0
                      ) {
                        params.set('badges', ev.target.value.toString());
                      }
                      history.push({
                        pathname: location.pathame,
                        search: params.toString(),
                      });
                    }}
                    input={<Input id="personas-badges-select-multiple" />}
                    renderValue={() => (
                      <div className={classes.chips}>
                        {selectedBadges.map(value => (
                          <Chip
                            key={value}
                            label={value}
                            className={classes.chip}
                          />
                        ))}
                      </div>
                    )}
                  >
                    {badges.map(badge => (
                      <MenuItem key={badge.uuid} value={badge.name}>
                        {badge.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
              ) : null}
              {communities &&
              Array.isArray(communities) &&
              communities.length > 0 ? (
                <Grid item className={classes.formControl} xs>
                  <InputLabel id="personas-communities-label">
                    Communities
                  </InputLabel>
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
                        params.set('communities', ev.target.value.toString());
                      }
                      history.push({
                        pathname: location.pathame,
                        search: params.toString(),
                      });
                    }}
                    input={<Input id="personas-communities-select-multiple" />}
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
              ) : null}
            </Grid>

            {personas && personas.totalCount > 0 && !loadingPersonas && (
              <PersonaSortOptions
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

            {!personas ||
            (personas && personas.totalCount <= 0 && !loadingPersonas) ? (
              <div>No personas have been added to this community.</div>
            ) : (
              <List>
                {personas &&
                  personas.data.map(row => (
                    <ListItem key={row.id} className={classes.listItem}>
                      <PersonaCard persona={row} />
                    </ListItem>
                  ))}
              </List>
            )}

            {personas && personas.totalCount > params.get('limit') && (
              <Pagination
                count={Math.ceil(personas.totalCount / params.get('limit'))}
                page={parseInt('' + params.get('page'))}
                onChange={(ev, page) => {
                  params.set('page', page);
                  history.push({
                    pathname: location.pathname,
                    search: params.toString(),
                  });
                }}
              />
            )}
          </Container>
        </Box>
        <Footer />
      </div>
    );
  }
}

function PersonaSortOptions({ sort, order, onChange }) {
  const classes = useStyles();
  const isMobile = useIsMobile();

  return (
    <Grid container item className={classes.sortOptions} alignItems="center">
      {[
        'name',
        'recentRapid',
        'recentFull',
        'recentRequests',
        'dateJoined',
      ].map(name => (
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
                  : 'Name'
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
                  : name === 'dateJoined'
                  ? isMobile
                    ? 'Joined'
                    : 'Date Joined'
                  : isMobile
                  ? 'Name'
                  : 'Name'}
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
      ))}
    </Grid>
  );
}

PersonaSortOptions.propTypes = {
  onChange: PropTypes.func.isRequired,
  sort: PropTypes.oneOf([
    'name',
    'recentRequests',
    'recentFull',
    'recentRapid',
    'recentRequests',
    'dateJoined',
    '',
  ]),
  order: PropTypes.string,
};
