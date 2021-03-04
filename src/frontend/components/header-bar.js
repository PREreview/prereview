import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MdMenu } from 'react-icons/md';
import PreReviewLogo from './pre-review-logo';
import IconButton from './icon-button';
import UserBadge from './user-badge';
import NoticeBadge from './notice-badge';
import { useIsMobile } from '../hooks/ui-hooks';

// material-ui
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';

// components
import Banner from './banner';

const useStyles = makeStyles(theme => ({
  content: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem',
  },
  headerBar: {
    boxShadow: '0 0 5px #000',
  },
  navItem: {
    color: '#000 !important', // #FIXME remove after porting to MUI
    fontSize: '1rem',
    marginLeft: '1rem',
  },
}));

export default function HeaderBar({ onClickMenuButton, thisUser }) {
  const classes = useStyles();
  const isMobile = useIsMobile();
  const showProfileNotice = false;

  const [loginLink, setLoginLink] = useState('/login');
  const [homeLink, setHomeLink] = useState('/');

  useEffect(() => {
    const host = window.location.host;
    const labels = host.split('.');

    if (
      labels.length === 3 ||
      (labels.length === 2 && labels[1].includes('localhost'))
    ) {
      if (labels[0] === 'outbreaksci') {
        setLoginLink('https://prereview.org/login');
        setHomeLink('https://prereview.org');
        console.debug('Subdomain found');
      }
    }
  }, []);

  return (
    <Box className={classes.headerBar}>
      <Banner />

      {!!onClickMenuButton && (
        <IconButton
          data-noclickoutside="true"
          onClickCapture={onClickMenuButton}
          className="header-bar__menu-button"
        >
          <MdMenu
            className="header-bar__menu-button-icon"
            data-noclickoutside="true"
          />
        </IconButton>
      )}

      <Box className={classes.content}>
        <Box className={classes.logo}>
          <Link to="/" href={homeLink}>
            <PreReviewLogo />
          </Link>
        </Box>

        <Box className={classes.nav}>
          <Link
            className={classes.navItem}
            color="textPrimary"
            href="https://content.prereview.org/about"
          >
            About
          </Link>
          <Link
            className={classes.navItem}
            color="textPrimary"
            href="https://content.prereview.org/people"
          >
            People
          </Link>
          <Link
            className={classes.navItem}
            color="textPrimary"
            href="https://content.prereview.org/programs"
          >
            Programs
          </Link>
          <Link
            className={classes.navItem}
            color="textPrimary"
            href="/communities"
          >
            Communities
          </Link>
          <Link
            className={classes.navItem}
            color="textPrimary"
            href="https://content.prereview.org/resources"
          >
            Resources
          </Link>
          <Link
            className={classes.navItem}
            color="textPrimary"
            href="https://content.prereview.org/coc"
          >
            {isMobile ? (
              <abbr title="Code of Conduct">CoC</abbr>
            ) : (
              <span>Code of Conduct</span>
            )}
          </Link>
          <Link
            className={classes.navItem}
            color="textPrimary"
            href="https://content.prereview.org"
          >
            Blog
          </Link>
          <Link
            className={classes.navItem}
            color="textPrimary"
            href="/api/docs"
          >
            API
          </Link>
          <span className={`header-bar__nav-item--user-badge`}>
            {thisUser ? (
              <UserBadge user={thisUser} showNotice={showProfileNotice}>
                {showProfileNotice && (
                  <Link
                    to={process.env.IS_EXTENSION ? undefined : '/settings'}
                    href={`/settings`}
                    target={process.env.IS_EXTENSION ? '_blank' : undefined}
                  >
                    Complete Profile
                    <div className="menu__link-item__icon">
                      <NoticeBadge />
                    </div>
                  </Link>
                )}

                <Link
                  to={process.env.IS_EXTENSION ? undefined : '/settings'}
                  href={`/settings`}
                  target={process.env.IS_EXTENSION ? '_blank' : undefined}
                >
                  User Settings
                </Link>

                {thisUser.isAdmin && (
                  <Link
                    to={process.env.IS_EXTENSION ? undefined : '/admin'}
                    href={`/admin`}
                    target={process.env.IS_EXTENSION ? '_blank' : undefined}
                  >
                    Admin Settings
                  </Link>
                )}

                {thisUser.isAdmin && (
                  <Link
                    to={process.env.IS_EXTENSION ? undefined : '/block'}
                    href={`/block`}
                    target={process.env.IS_EXTENSION ? '_blank' : undefined}
                  >
                    Moderate Users
                  </Link>
                )}

                {thisUser.isAdmin && ( // #FIXME should this be isModerator ?
                  <Link
                    to={process.env.IS_EXTENSION ? undefined : '/moderate'}
                    href={`/moderate`}
                    target={process.env.IS_EXTENSION ? '_blank' : undefined}
                  >
                    Moderate Reviews
                  </Link>
                )}

                <Link to="/logout" href={`/logout`}>
                  Logout
                </Link>
              </UserBadge>
            ) : (
              <Link to="/login" href={loginLink} className={classes.navItem}>
                Log In / Sign Up
              </Link>
            )}
          </span>
        </Box>
        {/* TODO link to feedback form */}
        <div className={classes.navItem}>
          <a
            href="https://forms.gle/BjHvfBWXYVchUwvs9"
            target="_blank"
            rel="noopener noreferrer"
          >
            Give Feedback
          </a>
        </div>
      </Box>
    </Box>
  );
}

HeaderBar.propTypes = {
  onClickMenuButton: PropTypes.func,
  thisUser: PropTypes.object,
};
