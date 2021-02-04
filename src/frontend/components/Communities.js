// base imports
import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import { useGetCommunities } from '../hooks/api-hooks.tsx';

// utils
import { processParams, searchParamsToObject } from '../utils/search';

// components
import CommunityCard from './CommunityCard.js';
import HeaderBar from './header-bar';
import Loading from './loading';
import SearchBar from './search-bar';

// Material-ui components
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

// constants
import { ORG } from '../constants';

const useStyles = makeStyles(() => ({
  communities: {
    overflow: 'hidden',
  },
  container: {
    marginBottom: '3rem',
    marginTop: 72,
    overflow: 'hidden',
  },
}));

const Communities = () => {
  const classes = useStyles();
  const [user] = useContext(UserProvider.context);

  const params = processParams(location.search);
  const [search, setSearch] = useState(params.get('search') || '');

  const { data: communities, loading: loading, error } = useGetCommunities({
    queryParams: searchParamsToObject(params),
  });

  console.log(communities);

  if (loading) {
    return <Loading />;
  } else if (error) {
    console.log(error);
    return <div>An error occurred: {error.message}</div>;
  } else {
    return (
      <div className={classes.communities}>
        <Helmet>
          <title>Communities • {ORG}</title>
        </Helmet>
        <HeaderBar thisUser={user} />

        <Container className={classes.container} maxWidth="md">
          <Box m={4}>
            <Typography variant="h3" component="h1" gutterBottom={true}>
              Communities
            </Typography>
            <SearchBar
              defaultValue={search}
              isFetching={loading}
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
            {communities.data.length
              ? communities.data.map(community => (
                  <CommunityCard key={community.uuid} community={community} />
                ))
              : null}
          </Box>
        </Container>
      </div>
    );
  }
};

export default Communities;
