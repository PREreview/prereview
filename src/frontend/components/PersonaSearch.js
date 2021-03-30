// base imports
import React, { useContext, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import Tooltip from '@reach/tooltip';
import { useIsMobile } from '../hooks/ui-hooks';
import classNames from 'classnames';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import {
  useGetBadges,
  useGetCommunities,
  useGetPersonas,
} from '../hooks/api-hooks.tsx';

// components
import HeaderBar from './header-bar';
import Loading from './loading';
import SearchBar from './search-bar';
import LoginRequiredModal from './login-required-modal';
import PersonaCard from './PersonaCard';

// Material-ui components
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Pagination from '@material-ui/lab/Pagination';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles(theme => ({
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
    maxWidth: theme.breakpoints.values['md'],
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
    padding: theme.spacing(2),
    [theme.breakpoints.up('lg')]: {
      textAlign: 'left',
    },
  },
  avatar: {
    width: theme.spacing(10),
    height: theme.spacing(10),
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: theme.spacing(2),
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
    } else if (key.toLowerCase() === 'badges') {
      const badges = value ? value.split(',') : [];
      processed.append('badges', badges);
    } else if (key.toLowerCase() === 'communities') {
      const communities = value ? value.split(',') : [];
      processed.append('communities', communities);
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

export default function Personas() {
  const history = useHistory();
  const location = useLocation();
  const params = processParams(location.search);
  const [thisUser] = useContext(UserProvider.context);
  const isMobile = useIsMobile();
  const [showLeftPanel, setShowLeftPanel] = useState(!isMobile);

  const classes = useStyles();
  const [search, setSearch] = useState(params.get('search') || '');
  const [loginModalOpenNext, setLoginModalOpenNext] = useState(null);
  const [selectedBadges, setSelectedBadges] = useState(
    params.get('badges') || [],
  );
  const [selectedCommunities, setSelectedCommunities] = useState(
    params.get('communities') || [],
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

  if (loadingPersonas || loadingBadges || loadingCommunities) {
    return <Loading />;
  } else if (personaError || badgeError || communityError) {
    return (
      <div>
        An error occurred:{' '}
        {personaError ? personaError : badgeError ? badgeError : communityError}
      </div>
    );
  } else {
    return (
      <div className="home">
        <Helmet>
          <title>PREreview • Search Personas</title>
        </Helmet>
        <HeaderBar
          thisUser={thisUser}
          onClickMenuButton={() => {
            setShowLeftPanel(!showLeftPanel);
          }}
        />

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
        {loginModalOpenNext && (
          <LoginRequiredModal
            next={loginModalOpenNext}
            onClose={() => {
              setLoginModalOpenNext(null);
            }}
          />
        )}
        <div className="home__main">
          <div className="home__content">
            <div className="home__content-header">
              <Grid container direction="column">
                <h3 className="home__content-title">PREreview User Personas</h3>
                <Grid container>
                  <Grid className={classes.formControl} spacing={2}>
                    {badges && Array.isArray(badges) && badges.length > 0 ? (
                      <Grid item xs={12} sm={6} md={3}>
                        <InputLabel id="personas-badges-label">
                          Badges
                        </InputLabel>
                        <Select
                          labelId="personas-badges-label"
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
                  </Grid>
                  <Grid className={classes.formControl} spacing={2}>
                    {communities &&
                    Array.isArray(communities) &&
                    communities.length > 0 ? (
                      <Grid item xs={12} sm={6} md={3}>
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
                            <MenuItem
                              key={community.uuid}
                              value={community.name}
                            >
                              {community.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </Grid>
                    ) : null}
                  </Grid>
                </Grid>
                <Grid container>
                  {personas && personas.totalCount > 0 && !loadingPersonas && (
                    <PersonaSortOptions
                      sort={params.get('sort') || ''}
                      order={params.get('asc') === 'true' ? 'asc' : 'desc'}
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
                </Grid>
                <Grid
                  container
                  spacing={1}
                  direction="column"
                  justify="center"
                  alignItems="stretch"
                >
                  {personas && personas.totalCount === 0 && !loadingPersonas ? (
                    <div>No personas have been added to this community.</div>
                  ) : (
                    personas &&
                    personas.data.map(persona => (
                      <Grid item key={persona.uuid}>
                        <PersonaCard persona={persona} />
                      </Grid>
                    ))
                  )}
                </Grid>
                {personas && personas.totalCount > params.get('limit') && (
                  <Grid item>
                    <Pagination
                      count={Math.ceil(
                        personas.totalCount / params.get('limit'),
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
                  </Grid>
                )}
              </Grid>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function PersonaSortOptions({ sort, order, onChange }) {
  const isMobile = useIsMobile();

  return (
    <div className="sort-options">
      {[
        'name',
        'recentRapid',
        'recentFull',
        'recentRequests',
        'dateJoined',
      ].map(name => (
        <div
          key={name}
          className={classNames('sort-options__item', {
            'sort-options__item--active': name === sort,
          })}
        >
          <input
            type="radio"
            id={`sort-options-${name}`}
            name={name}
            value={name}
            onClick={e => {
              const sortOption = e.target.value;
              onChange(sortOption, order === 'asc' ? 'desc' : 'asc');
            }}
          />
          <Tooltip
            label={`Sort by ${
              name === 'recentRapid'
                ? 'Date of latest Rapid Review'
                : name === 'recentFull'
                ? 'Date of latest Full Review'
                : name === 'recentRequests'
                ? 'Date of latest request for review'
                : 'User persona name'
            }`}
          >
            <label
              className="sort-options__item-text"
              htmlFor={`sort-options-${name}`}
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
                : 'User persona name'}
            </label>
          </Tooltip>

          {order === 'asc' ? (
            <MdArrowUpward
              className={classNames('sort-options__icon', {
                'sort-options__icon--selected': name === sort,
              })}
            />
          ) : (
            <MdArrowDownward
              className={classNames('sort-options__icon', {
                'sort-options__icon--selected': name === sort,
              })}
            />
          )}
        </div>
      ))}
    </div>
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
