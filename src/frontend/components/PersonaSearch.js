// base imports
import React, { Suspense, useContext, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';
import MuiSearchBar from 'material-ui-search-bar';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import Tooltip from '@reach/tooltip';
import { useIsMobile } from '../hooks/ui-hooks';
import classNames from 'classnames';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import { useGetBadges, useGetPersonas } from '../hooks/api-hooks.tsx';

// components
import HeaderBar from './header-bar';
import Loading from './loading';
import NotFound from './not-found';
import SearchBar from './search-bar';
import LoginRequiredModal from './login-required-modal';
import PersonaCard from './PersonaCard';

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

export default function UserSearch() {
  const history = useHistory();
  const location = useLocation();
  const params = processParams(location.search);
  const [thisUser] = useContext(UserProvider.context);
  const isMobile = useIsMobile();
  const [showLeftPanel, setShowLeftPanel] = useState(!isMobile);

  const classes = useStyles();
  const [search, setSearch] = useState(params.get('search') || '');
  const [loginModalOpenNext, setLoginModalOpenNext] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  const { data: personas, loading: loadingPersonas, error } = useGetPersonas({
    //queryParams: { ...searchParamsToObject(params), communities: community.uuid, tags: selectedTags.toString() },
    queryParams: searchParamsToObject(params),
  });
  const [hoveredSortOption, setHoveredSortOption] = useState(null);

  if (loadingPersonas) {
    return <Loading />;
  } else if (error) {
    return <div>An error occurred: {error}</div>;
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

        <UserSearchBar
          defaultValue={search}
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
                {/*
        <FormControl className={classes.formControl}>
          <InputLabel id="demo-mutiple-chip-label">Tags</InputLabel>
          <Select
            labelId="demo-mutiple-chip-label"
            id="demo-mutiple-chip"
            multiple
            value={selectedTags}
            onChange={ev => setSelectedTags(ev.target.value)}
            input={<Input id="select-multiple-chip" />}
            renderValue={selected => (
              <div className={classes.chips}>
                {selected.map(value => (
                  <Chip key={value} label={value} className={classes.chip} />
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
        </FormControl>
          */}
                <Grid container>
                  {personas && personas.totalCount > 0 && !loadingPersonas && (
                    <UserSortOptions
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
                </Grid>
                <Grid container spacing={1} direction="column" justify="center" alignItems="stretch">
                  {personas && personas.totalCount === 0 && !loadingPersonas ? (
                    <div>No personas have been added to this community.</div>
                  ) : (
                    personas &&
                    personas.data.map(persona => (
                      <Grid item key={persona.id}>
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

function UserSearchBar({
  isFetching,
  defaultValue,
  onChange,
  onCancelSearch,
  onRequestSearch,
}) {
  const isMobile = useIsMobile();

  return (
    <div className="search-bar">
      <div className="search-bar__left-spacer" />
      <div className="search-bar__search-box">
        <MuiSearchBar
          value={defaultValue}
          onChange={value => onChange(value)}
          onCancelSearch={onCancelSearch}
          onRequestSearch={onRequestSearch}
          className="search-bar__search-box__input"
          placeholder={
            isMobile
              ? 'Search name or bio'
              : 'Search user personas by name or bio '
          }
          disabled={isFetching}
        />
      </div>
      <div className="search-bar__right-spacer" />
    </div>
  );
}

UserSearchBar.propTypes = {
  isFetching: PropTypes.bool,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  onRequestSearch: PropTypes.func,
  onCancelSearch: PropTypes.func,
};

function UserSortOptions({
  sort,
  order,
  onChange,
  onMouseEnterSortOption,
  onMouseLeaveSortOption,
}) {
  const isMobile = useIsMobile();

  return (
    <div className="sort-options">
      {['name', 'recentRapid', 'recentFull', 'recentRequests', 'dateJoined'].map(
        name => (
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
              if (!isMobile) {
                onMouseLeaveSortOption(sortOption);
              }
            }}
          />
          <Tooltip
              label={`Sort by ${name === 'recentRapid'
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
              onMouseEnter={() => {
                if (!isMobile) {
                  onMouseEnterSortOption(name);
                }
              }}
              onMouseLeave={() => {
                if (!isMobile) {
                  onMouseLeaveSortOption(name);
                }
              }}
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

UserSortOptions.propTypes = {
  onChange: PropTypes.func.isRequired,
  sort: PropTypes.oneOf(['name', '']),
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
  onMouseEnterSortOption: PropTypes.func.isRequired,
  onMouseLeaveSortOption: PropTypes.func.isRequired,
};
