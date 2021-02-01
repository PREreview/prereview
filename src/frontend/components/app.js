// base imports
import React, { Suspense, lazy, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import mobile from 'is-mobile';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DndProvider } from 'react-dnd';
import { Switch, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
//import smoothscroll from 'smoothscroll-polyfill';
import 'url-search-params-polyfill'; /* pollyfill for IE / Edge */
import { IntlProvider } from 'react-intl';

// contexts
import UserProvider from '../contexts/user-context';
import { StoresProvider } from '../contexts/store-context';

// components
import About from './about';
import AdminPanel from './admin-panel';
import BlockPanel from './block-panel';
import CodeOfConduct from './code-of-conduct';
import Community from './Community';
import ExtensionFallback from './extension-fallback';
import ExtensionSplash from './extension-splash';
import Home from './home';
import Login from './login';
import Logout from './logout';
import ModeratorRoute from './moderator-route';
import NotFound from './not-found';
import PrivateRoute, { AdminRoute } from './private-route';
import Profile from './profile';
import Settings from './settings';
import SuspenseLoading from './suspense-loading';
import ToCPage from './toc-page';
import PersonaSearch from './PersonaSearch';

// constants
import API from './api';

// icons
import PreReviewLogo from './pre-review-logo';

const Moderate = React.lazy(() => import('./moderate'));

// kick off the polyfill!
//smoothscroll.polyfill();

export default function App({ user }) {
  const [loading, setLoading] = useState(true);

  return (
    <HelmetProvider>
      <IntlProvider>
        <DndProvider
          backend={mobile({ tablet: true }) ? TouchBackend : HTML5Backend}
        >
          <StoresProvider>
            <UserProvider user={user}>
              <Switch>
                <Route path="/:new(new)?" exact={true}>
                  <Home />
                </Route>
                <Route exact={true} path="/login">
                  <Login />
                </Route>
                <Route exact={true} path="/logout">
                  <Logout />
                </Route>

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

                <Route exact={true} path="/personas">
                  <PersonaSearch />
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
                <Route
                  exact={true}
                  path="/communities/:id"
                >
                  <Community />
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
  user: PropTypes.shape({
    '@id': PropTypes.string,
    hasRole: PropTypes.array,
  }),
};
