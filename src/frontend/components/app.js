// base imports
import React, { Suspense, lazy, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { DndProvider } from 'react-dnd';
import { HelmetProvider } from 'react-helmet-async';
import { HTML5Backend } from 'react-dnd-html5-backend';
import mobile from 'is-mobile';
import { Switch, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import { TouchBackend } from 'react-dnd-touch-backend';
//import smoothscroll from 'smoothscroll-polyfill';
import 'url-search-params-polyfill'; /* pollyfill for IE / Edge */
import { IntlProvider } from 'react-intl';

// contexts
import UserProvider from '../contexts/user-context';
import { StoresProvider } from '../contexts/store-context';

// components
import AdminPanel from './admin-panel';
import BlockPanel from './block-panel';
import Community from './Community';
import Communities from './Communities';
import CommunityPanel from './community-panel';
import Dashboard from './dashboard'
import Event from './Event';
import ExtensionFallback from './extension-fallback';
import ExtensionSplash from './extension-splash';
import Home from './home';
import Loading from './loading';
import Login from './login';
import Logout from './logout';
import ModeratorRoute from './moderator-route';
import NotFound from './not-found';
import PrivateRoute, { AdminRoute } from './private-route';
import Profile from './profile';
import Reviews from './reviews';
import SettingsAPI from './settings-api';
import SettingsDrafts from './settings-drafts';
import SettingsTemplates from './settings-templates';
import PersonaSearch from './PersonaSearch';
import Validate from './Validate';

// Material UI customized theme
import theme from '../theme.js';

const Moderate = React.lazy(() => import('./moderate'));

// kick off the polyfill!
//smoothscroll.polyfill();

export default function App({ user }) {
  const [loading, setLoading] = useState(true);
  const [subdomain, setSubdomain] = useState(null);

  useEffect(() => {
    const host = window.location.host;
    const labels = host.split('.');

    if (labels.length === 3 || (labels.length === 2 && labels[1].includes('localhost'))) {
      if (labels[0] === 'outbreaksci') {
        setSubdomain(labels[0]);
        console.debug('Subdomain found');
      }
    }
  }, []);

  return (
    <HelmetProvider>
      <IntlProvider>
        <DndProvider
          backend={mobile({ tablet: true }) ? TouchBackend : HTML5Backend}
        >
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
                <Route exact={true} path="/personas">
                  <PersonaSearch />
                </Route>
                <Route exact={true} path="/about/:id">
                  <Profile />
                </Route>
                <Route exact={true} path="/extension">
                  <ExtensionSplash />
                </Route>
                <PrivateRoute exact={true} path="/settings/api">
                  <SettingsAPI />
                </PrivateRoute>
                <PrivateRoute exact={true} path="/settings/drafts">
                  <SettingsDrafts />
                </PrivateRoute>
                <AdminRoute exact={true} path="/admin">
                  <AdminPanel />
                </AdminRoute>
                <AdminRoute exact={true} path="/block">
                  <BlockPanel />
                </AdminRoute>
                <AdminRoute exact={true} path="/templates">
                  <SettingsTemplates />
                </AdminRoute>
                <Route exact={true} path="/community-settings/:id">
                  <CommunityPanel />
                </Route>
                <ModeratorRoute exact={true} path="/moderate">
                  <Suspense fallback={<Loading />}>
                    <Moderate />
                  </Suspense>
                </ModeratorRoute>
                <Route
                  exact={true}
                  path="/preprints/:id"
                >
                  <ExtensionFallback />
                </Route>
                <Route
                  exact={true}
                  path="/communities/"
                  >
                  <Communities />
                </Route>
                <Route
                  exact={true}
                  path="/communities/:id"
                  >
                  <Community />
                </Route>

                <Route
                  exact={true}
                  path="/events/:id"
                  >
                  <Event />
                </Route>

                <Route
                  exact={true}
                  path="/preprints/:id/reviews/:cid?"
                >
                  <ExtensionFallback />
                </Route>
                <Route
                  exact={true}
                  path="/validate/:token"
                  >
                  <Validate />
                </Route>

                <Route>
                <NotFound />
              </Route>
            </Switch>
          </UserProvider>
        </StoresProvider>
      </DndProvider>
      </IntlProvider>
    </HelmetProvider>
  );
}

App.propTypes = {
  // `null` if user is not logged in
  user: PropTypes.object,
};
