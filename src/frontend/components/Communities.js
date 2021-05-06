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
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import MuiButton from '@material-ui/core/Button';
import Pagination from '@material-ui/lab/Pagination';
import Typography from '@material-ui/core/Typography';

// constants
import { ORG } from '../constants';

const Button = withStyles({
  root: {
    textTransform: 'none',
  },
})(MuiButton);

const useStyles = makeStyles(theme => ({
  buttonTag: {
    fontSize: '0.8rem',
    fontWeight: 'normal',
    margin: '0.5rem',
    textTransform: 'none',
  },
  button: {
    color: `${theme.palette.primary.main}`,
  },
  buttonText: {
    fontSize: '1rem',
    textTransform: 'uppercase',
  },
  center: {
    textAlign: 'center',
  },
  communities: {
    overflow: 'hidden',
  },
  container: {
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
    queryParams: {
      ...searchParamsToObject(params),
      include_images: 'banner,avatar',
    },
  });

  const { data: tags, loading: loadingTags } = useGetTags();

  if (loading) {
    return <Loading />;
  } else if (error) {
    console.log(error);
    return <div>An error occurred: {error.message}</div>;
  } else {
    return (
      <>
        <div className={`${classes.communities} communities`}>
          <Helmet>
            <title>Communities • {ORG}</title>
          </Helmet>
          <HeaderBar thisUser={user} />

          <Container className={classes.container} maxWidth="lg">
            <Box m={4}>
              <Box mb={2}>
                <Grid
                  component="label"
                  container
                  alignItems="center"
                  justify="space-between"
                  spacing={8}
                >
                  <Grid item>
                    <Typography variant="h3" component="h1" gutterBottom={true}>
                      Communities
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} className={classes.center}>
                    <Button
                      type="button"
                      color="primary"
                      variant="outlined"
                      href={`https://forms.gle/3dDeanAhQggRZTef6`}
                    >
                      <span className={classes.buttonText}>
                        Start your own community
                      </span>
                    </Button>
                  </Grid>
                </Grid>
              </Box>
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
                <Grid item xs={12} md={12}>
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
                {/*
                <Grid item xs={12} md={4} className={classes.smallColumn}>
                  <Typography variant="h5" component="h2" gutterBottom={true}>
                    Search communities by tag
                    <Box mt={2}>
                      {!loadingTags && tags && tags.data.length ? (
                        tags.data.map(tag => (
                          <Chip
                            key={tag.uuid}
                            clickable
                            onClick={() =>
                              history.push(`/communities/?tags=${tag.name}`)
                            }
                            color="primary"
                            className={classes.buttonTag}
                            label={tag.name}
                          />
                        ))
                      ) : (
                        <div>No tags to display.</div>
                      )}
                    </Box>
                  </Typography>
                </Grid>
                  */}
              </Grid>
            </Box>
          </Container>
        </div>
      </>
    );
  }
};

export default Communities;
