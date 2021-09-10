import React from 'react';
import ReactDOM from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { RestfulProvider } from 'restful-react';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from './theme.js';
import App from './components/app.js';

ReactDOM.render(
  <HelmetProvider>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <RestfulProvider base="/api/v2/">
          <App />
        </RestfulProvider>
      </ThemeProvider>
    </BrowserRouter>
  </HelmetProvider>,
  document.getElementById('root'),
);

// Enable Hot Module Reloading
if (module.hot) {
  module.hot.accept();
}
