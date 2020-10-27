import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import HeaderBar from './header-bar';
import Banner from './banner';
import Button from './button';
// import LabelStyle from './label-style';
import { CONTACT_EMAIL_HREF, ORG } from '../constants';
import Org from './org';
import preview from '../assets/images/extension-preview.png';

export default function ExtensionSplash() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="extension-splash">
      <Helmet>
        <title>{ORG} • Get the extension</title>
      </Helmet>
      <Banner />
      <HeaderBar />
      <div className="extension-splash__content">
        <h1 className="extension-splash__title">
          Add Rapid PREreview to your browser
        </h1>

        <div className="extension-splash__body">
          <p>
            The <Org /> extension lets you read and add reviews (or requests for
            feedback) directly from the preprint sites you visit without having
            to navigate to the Rapid PREreview homepage.
          </p>
          <img
            src={preview}
            className="extension-splash__screenshot"
            aria-hidden="true"
            alt=""
          />
          <ul className="extension-splash__browser-list">
            <li className="extension-splash__browser-list-item">
              <Button
                element={'a'}
                href="https://chrome.google.com/webstore/detail/outbreak-science-rapid-pr/llglocdbioijhhfloamebnagdchmmabd"
                target="_blank"
                rel="noopener noreferrer"
                className="extension-splash__install-button"
                primary={true}
              >
                Install for Chrome
              </Button>
            </li>
            <li className="extension-splash__browser-list-item">
              <Button
                element={'a'}
                href="https://addons.mozilla.org/en-US/firefox/addon/outbreaksci-rapid-prereview/"
                target="_blank"
                rel="noopener noreferrer"
                className="extension-splash__install-button"
                primary={true}
              >
                Install for Firefox
              </Button>

              {/*
                  <Button
                  className="extension-splash__install-button"
                  primary={true}
                  disabled={true}
                  >
                  Install for Safari
                  </Button>
                  <br />
                  <div className="extension-splash__comming-soon">
                  <LabelStyle>(comming soon)</LabelStyle>
                  </div>*/}
            </li>
          </ul>

          <p className="extension-splash__request-browser">
            Don’t see support for your browser? <br />{' '}
            <a href={CONTACT_EMAIL_HREF}>let us know!</a>
          </p>
        </div>
      </div>
    </div>
  );
}
