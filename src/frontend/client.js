import React from 'react';
import ReactDOM from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { rehydrateMarks } from 'react-imported-component';
import { RestfulProvider } from 'restful-react';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from './theme.js';
import App from './components/app.js';

const hydrate = (app, element) => () => {
  ReactDOM.hydrate(app, element);
};

const start = ({ isProduction, document, module, hydrate }) => {
  const element = document.getElementById('root');
  const app = (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <RestfulProvider base="/api/v2/">
            <App />
          </RestfulProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );

  // In production, we want to hydrate instead of render
  // because of the server-rendering
  if (isProduction) {
    // rehydrate the bundle marks from imported-components,
    // then rehydrate the react app
    rehydrateMarks()
      .then(hydrate(app, element))
      .catch(err => {
        console.error(`Failed to rehydrate bundle marks: ${err}`);
      });
  } else {
    ReactDOM.render(app, element);
  }

  // Enable Hot Module Reloading
  if (module.hot) {
    module.hot.accept();
  }
};

const options = {
  isProduction: process.env.NODE_ENV === 'production',
  document: document,
  module: module,
  hydrate,
};

start(options);
