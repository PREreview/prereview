// base imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { HelmetProvider } from 'react-helmet-async';
import { Switch, Route } from 'react-router-dom';
import { IntlProvider } from 'react-intl';

// contexts
import UserProvider from '../contexts/user-context';
import { StoresProvider } from '../contexts/store-context';

// components
import AdminPanel from './admin-panel';
import Community from './Community';
import Communities from './Communities';
import CommunityPanel from './community-panel';
import Dashboard from './dashboard';
import Event from './Event';
import ExtensionFallback from './extension-fallback';
import Home from './home';
import Login from './login';
import Logout from './logout';
import NotFound from './not-found';
import PrivateRoute, { AdminRoute } from './private-route';
import Profile from './profile';
import Reviews from './reviews';
import SettingsAPI from './settings-api';
import SettingsDrafts from './settings-drafts';
import Personas from './Personas';
import Validate from './Validate';
import * as Fathom from 'fathom-client';

//const Moderate = React.lazy(() => import('./moderate'));

export default function App({ user }) {
  const [loading, setLoading] = useState(true);
  const [subdomain, setSubdomain] = useState(null);

  if (window.env.FATHOM_SITEID) {
    useEffect(() => {
      Fathom.load(window.env.FATHOM_SITEID, { spa: 'auto' });
    }, []);
  }

  useEffect(() => {
    const host = window.location.host;
    const labels = host.split('.');

    if (
      labels.length === 3 ||
      (labels.length === 2 && labels[1].includes('localhost'))
    ) {
      if (labels[0] === 'outbreaksci') {
        setSubdomain(labels[0]);
        console.debug('Subdomain found');
      }
    }
  }, []);

  return (
    <HelmetProvider>
      <IntlProvider locale="en">
        <StoresProvider>
          <UserProvider user={user}>
            <Switch>
              <Route path="/" exact={true}>
                {subdomain && subdomain === 'outbreaksci' ? (
                  <Community id="outbreaksci" />
                ) : (
                  <Home />
                )}
              </Route>
              <Route exact={true} path="/login">
                <Login />
              </Route>
              <Route exact={true} path="/logout">
                <Logout />
              </Route>

              <Route exact={true} path="/dashboard/:new(new)?">
                <Dashboard />
              </Route>

              <Route exact={true} path="/reviews/:new(new)?">
                <Reviews />
              </Route>
              <Route exact={true} path="/prereviewers">
                <Personas />
              </Route>
              <Route exact={true} path="/about/:id">
                <Profile />
              </Route>
              {/*
              <Route exact={true} path="/extension">
                <ExtensionSplash />
              </Route>
      */}
              <PrivateRoute exact={true} path="/settings/api">
                <SettingsAPI />
              </PrivateRoute>
              <PrivateRoute exact={true} path="/settings/drafts">
                <SettingsDrafts />
              </PrivateRoute>
              <AdminRoute exact={true} path="/admin">
                <AdminPanel />
              </AdminRoute>
              {/*
              <AdminRoute exact={true} path="/block">
                <BlockPanel />
              </AdminRoute>
      */}
              <Route exact={true} path="/community-settings/:id">
                <CommunityPanel />
              </Route>
              {/*
              <ModeratorRoute exact={true} path="/moderate">
                <Suspense fallback={<SuspenseLoading>Loading</SuspenseLoading>}>
                  <Moderate />
                </Suspense>
              </ModeratorRoute>
      */}
              <Route exact={true} path="/preprints/:id">
                <ExtensionFallback />
              </Route>
              <Route exact={true} path="/communities/">
                <Communities />
              </Route>
              <Route exact={true} path="/communities/:id/:new(new)?">
                <Community />
              </Route>

              <Route exact={true} path="/events/:id">
                <Event />
              </Route>

              <Route exact={true} path="/preprints/:id/reviews/:cid?">
                <ExtensionFallback />
              </Route>
              <Route exact={true} path="/validate/:token">
                <Validate />
              </Route>

              <Route exact={true} path="/preprints/:id/drafts/:cid?">
                <ExtensionFallback />
              </Route>
              <Route exact={true} path="/preprints/:id/full-reviews/:cid">
                <ExtensionFallback />
              </Route>
              <Route exact={true} path="/preprints/:id/reviews/:cid">
                <ExtensionFallback />
              </Route>
              <Route exact={true} path="/preprints/:id/rapid-reviews/:cid">
                <ExtensionFallback />
              </Route>
              <Route exact={true} path="/validate/:token">
                <Validate />
              </Route>

              <Route>
                <NotFound />
              </Route>
            </Switch>
          </UserProvider>
        </StoresProvider>
      </IntlProvider>
    </HelmetProvider>
  );
}

App.propTypes = {
  // `null` if user is not logged in
  user: PropTypes.object,
};
