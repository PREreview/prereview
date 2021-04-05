// base imports
import React, { useContext } from 'react';
import { Helmet } from 'react-helmet-async';

// contexts
import UserProvider from '../contexts/user-context';

// MaterialUI imports
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

// components
import HeaderBar from './header-bar';
import Org from './org';

// constants
import { ORG } from '../constants';

export default function NotFound() {
  const [thisUser] = useContext(UserProvider.context);

  return (
    <>
      <HeaderBar thisUser={thisUser} />

      <Helmet>
        <title>{ORG} • Not Found</title>
      </Helmet>

      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: '80vh' }}
      >
        <Grid item xs={3}>
          <Typography component="h2" variant="h2">
            Not found
          </Typography>
          <Typography component="div" variant="body2">
            Visit <Org />{' '}
            <Link href="/" color="primary">
              homepage
            </Link>
          </Typography>
        </Grid>
      </Grid>
    </>
  );
}
