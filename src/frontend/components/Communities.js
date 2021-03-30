// base imports
import React, { useContext, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import { useGetCommunities, useGetTags } from '../hooks/api-hooks.tsx';

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
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Pagination from '@material-ui/lab/Pagination';
import Typography from '@material-ui/core/Typography';

// constants
import { ORG } from '../constants';

const useStyles = makeStyles(theme => ({
  button: {
    color: `${theme.palette.primary.main} !important`,
    margin: '0.5rem',
    textTransform: 'none',
  },
  communities: {
    overflow: 'hidden',
  },
  container: {
    marginBottom: '3rem',
    marginTop: 72,
    overflow: 'hidden',
  },
  smallColumn: {
    marginTop: '2.5rem',
  },
}));

const Communities = () => {
  const classes = useStyles();
  const [user] = useContext(UserProvider.context);
  const history = useHistory();
  const location = useLocation();
  const params = processParams(location.search);

  const [search, setSearch] = useState(params.get('search') || '');

  const { data: communities, loading: loading, error } = useGetCommunities({
    queryParams: searchParamsToObject(params),
  });

  const { data: tags, loading: loadingTags } = useGetTags();

  if (loading) {
    return <Loading />;
  } else if (error) {
    console.log(error);
    return <div>An error occurred: {error.message}</div>;
  } else {
    return (
      <div className={`${classes.communities} communities`}>
        <Helmet>
          <title>Communities • {ORG}</title>
        </Helmet>
        <HeaderBar thisUser={user} />

        <Container className={classes.container} maxWidth="lg">
          <Box m={4}>
            <Typography variant="h3" component="h1" gutterBottom={true}>
              Communities
            </Typography>
            <SearchBar
              defaultValue={search}
              placeholderValue="Search communities by name, description, members, events, or preprints"
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
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                {communities && communities.totalCount === 0 && !loading ? (
                  <div>No communities found.</div>
                ) : (
                  <>
                    {communities &&
                      communities.data.map(community => (
                        <CommunityCard
                          key={community.uuid}
                          community={community}
                        />
                      ))}
                  </>
                )}

                {communities && communities.totalCount > params.get('limit') && (
                  <div className="home__pagination">
                    <Pagination
                      count={Math.ceil(
                        communities.totalCount / params.get('limit'),
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
              <Grid item xs={12} md={4} className={classes.smallColumn}>
                <Typography variant="h5" component="h2" gutterBottom={true}>
                  Search communities by tag
                  <Box mt={4}>
                    {!loadingTags && tags && tags.data.length ? (
                      tags.data.map(tag => (
                        <Button
                          key={tag.uuid}
                          href={`/communities/?tags=${tag.name}`}
                          variant="outlined"
                          color="primary"
                          className={classes.button}
                        >
                          {tag.name}
                        </Button>
                      ))
                    ) : (
                      <div>No tags to display.</div>
                    )}
                  </Box>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </div>
    );
  }
};

export default Communities;
