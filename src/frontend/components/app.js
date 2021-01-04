// base imports
import React, { Suspense, lazy, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import mobile from 'is-mobile';
import Cookies from 'js-cookie';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DndProvider } from 'react-dnd';
import { Switch, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
//import smoothscroll from 'smoothscroll-polyfill';
import 'url-search-params-polyfill'; /* pollyfill for IE / Edge */

// Material UI
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

// contexts
import { UserProvider } from '../contexts/user-context';
import { StoresProvider } from '../contexts/store-context';

// components
import About from './about';
import AdminPanel from './admin-panel';
import BlockPanel from './block-panel';
import CodeOfConduct from './code-of-conduct';
import ExtensionFallback from './extension-fallback';
import ExtensionSplash from './extension-splash';
import Home from './home';
import Login from './login';
import ModeratorRoute from './moderator-route';
import NotFound from './not-found';
import PrivateRoute, { AdminRoute } from './private-route';
import Profile from './profile';
import Settings from './settings';
import SuspenseLoading from './suspense-loading';
import ToCPage from './toc-page';

// constants
import API from './api';

// icons
import PreReviewLogo from './pre-review-logo';

const Moderate = React.lazy(() => import('./moderate'));

// kick off the polyfill!
//smoothscroll.polyfill();

const useStyles = makeStyles((theme) => ({
  root: {
    left: '50%',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
  },
  spinning: {
    color: '#ff3333',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 30,
  },
}));

export default function App({ user }) {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [thisUser, setThisUser] = useState(null);
  useEffect(() => {
    const username = Cookies.get('PRE_user');
    if (username) {
      fetch(`api/v2/users/${username}`)
        .then(response => {
          if (response.status === 200) {
            return response.json();
          }
          throw new Error(response.message);
        })
        .then(result => {
          setThisUser(result.data);
          return setLoading(false);
        })
        .catch(err => {
          console.log('An error occurred: ', err.message);
        });
    } else {
      setLoading(false);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className={classes.root}>
        <PreReviewLogo />
        <CircularProgress className={classes.spinning} size={60} />
      </div>
    );
  } else {
    return (
      <HelmetProvider>
        <DndProvider
          backend={mobile({ tablet: true }) ? TouchBackend : HTML5Backend}
        >
          <StoresProvider>
            <UserProvider user={thisUser}>
              <Switch>
                <Route path="/:new(new)?" exact={true}>
                  <Home />
                </Route>
                <Route exact={true} path="/login">
                  <Login />
                </Route>
                <Route exact={true} path="/logout" />

                <Route exact={true} path="/about">
                  <ToCPage>
                    <About />
                  </ToCPage>
                </Route>

                <Route exact={true} path="/code-of-conduct">
                  <ToCPage>
                    <CodeOfConduct />
                  </ToCPage>
                </Route>

                <Route exact={true} path="/api">
                  <ToCPage>
                    <API />
                  </ToCPage>
                </Route>

                <Route exact={true} path="/about/:id">
                  <Profile />
                </Route>
                <Route exact={true} path="/extension">
                  <ExtensionSplash />
                </Route>
                <PrivateRoute exact={true} path="/settings">
                  <Settings />
                </PrivateRoute>
                <AdminRoute exact={true} path="/admin">
                  <AdminPanel />
                </AdminRoute>
                <AdminRoute exact={true} path="/block">
                  <BlockPanel />
                </AdminRoute>
                <ModeratorRoute exact={true} path="/moderate">
                  <Suspense fallback={<SuspenseLoading>Loading</SuspenseLoading>}>
                    <Moderate />
                  </Suspense>
                </ModeratorRoute>
                <Route
                  exact={true}
                  path="/preprints/:id"
                >
                  <ExtensionFallback />
                </Route>

                <Route>
                  <NotFound />
                </Route>
              </Switch>
            </UserProvider>
          </StoresProvider>
        </DndProvider>
      </HelmetProvider>
    );
  }
}

App.propTypes = {
  // `null` if user is not logged in
  user: PropTypes.shape({
    '@id': PropTypes.string,
    hasRole: PropTypes.array,
  }),
};
