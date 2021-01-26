// base imports
import React, { Suspense, useContext, useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import { useGetCommunity } from '../hooks/api-hooks.tsx';

// components
import HeaderBar from './header-bar';
import Loading from './loading';
import NotFound from './not-found';

// Material-ui components
import Grid from '@material-ui/core/Grid';


export default function Community() {
  const location = useLocation();
  const [user] = useContext(UserProvider.context);

  const { id } = useParams();
  const { data: community, loading, error } = useGetCommunity({ id: id });

  if (loading) {
    return <Loading />;
  } else if (error) {
    return <NotFound />;
  } else {
    console.log('community:', community.data[0].name);
    return (
      <div className="community">
        <Helmet>
          <title>{community.data[0].name}</title>
        </Helmet>

        <Grid container xs="12">
          <Grid item xs="3"><h1>{community.data[0].name}</h1></Grid>
        </Grid>
        
      </div>
    );
  }
}
