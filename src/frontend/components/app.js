// base imports
import loadable from '@loadable/component';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { HelmetProvider } from 'react-helmet-async';
import { Switch, Route } from 'react-router-dom';
import { IntlProvider } from 'react-intl';

// contexts
import UserProvider from '../contexts/user-context';
import { StoresProvider } from '../contexts/store-context';

// components
import PrivateRoute, { AdminRoute } from './private-route';
import * as Fathom from 'fathom-client';

//const Moderate = React.lazy(() => import('./moderate'));
const AdminPanel = loadable(() => import('./admin-panel'));
const Community = loadable(() => import('./Community'));
const Communities = loadable(() => import('./Communities'));
const CommunityPanel = loadable(() => import('./community-panel'));
const Event = loadable(() => import('./Event'));
const ExtensionFallback = loadable(() => import('./extension-fallback'));
const Home = loadable(() => import('./home'));
const Login = loadable(() => import('./login'));
const Logout = loadable(() => import('./logout'));
const NotFound = loadable(() => import('./not-found'));
const Profile = loadable(() => import('./profile'));
const Reviews = loadable(() => import('./reviews'));
const Personas = loadable(() => import('./Personas'));
const Validate = loadable(() => import('./Validate'));
const Dashboard = loadable(() => import('./dashboard'));
const SettingsAPI = loadable(() => import('./settings-api'));
const SettingsDrafts = loadable(() => import('./settings-drafts'));

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
