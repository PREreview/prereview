import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// material-ui
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

// components
import Banner from './banner';
import NoticeBadge from './notice-badge';
import UserBadge from './user-badge';

// icons
import MenuIcon from '@material-ui/icons/Menu';
import PreReviewLogo from './pre-review-logo';

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
  mobileNav: {
    marginLeft: 'auto',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  mobileNavItem: {
    color: '#000 !important', // #FIXME remove after porting to MUI
  },
  nav: {
    marginRight: '1rem',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  navItem: {
    color: '#000 !important', // #FIXME remove after porting to MUI
    fontSize: '1.25rem',
    lineHeight: 1.75,
    padding: 8,
    textTransform: 'none',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      textDecoration: 'none',
    },
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  userBadge: {
    minWidth: 165,
  },
}));

export default function HeaderBar({ thisUser }) {
  const classes = useStyles();
  const showProfileNotice = false;

  const [loginLink, setLoginLink] = useState('/login');
  const [homeLink, setHomeLink] = useState('/');

  /* Handle popper menus */
  // #FIXME refactor
  const [aboutEl, setAboutEl] = useState(null);
  const [mobileEl, setMobileEl] = useState(null);
  const [programsEl, setProgramsEl] = useState(null);

  const handleClickAbout = event => {
    setAboutEl(aboutEl ? null : event.currentTarget);
  };

  const handleClickMobile = event => {
    setMobileEl(mobileEl ? null : event.currentTarget);
  };

  const handleClickPrograms = event => {
    setProgramsEl(programsEl ? null : event.currentTarget);
  };

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

      <Box className={classes.content}>
        <Box className={classes.logo} mr={4}>
          <Link to="/" href={homeLink}>
            <PreReviewLogo />
          </Link>
        </Box>

        <IconButton
          className={classes.mobileNav}
          color="inherit"
          aria-controls="mobile-menu"
          aria-haspopup="true"
          onClick={handleClickMobile}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          id="mobile-menu"
          anchorEl={mobileEl}
          keepMounted
          open={Boolean(mobileEl)}
          onClose={handleClickMobile}
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem>
            <Link className={classes.mobileNavItem} href="/reviews">
              Preprint Review Platform
            </Link>
          </MenuItem>
          <MenuItem className={classes.mobileNavItem}>Programs</MenuItem>
          <MenuItem className={classes.nested}>
            <Link className={classes.mobileNavItem} href="#FIXME">
              Open Reviewers
            </Link>
          </MenuItem>
          <MenuItem className={classes.nested}>
            <Link className={classes.mobileNavItem} href="#FIXME">
              LivePREJCs
            </Link>
          </MenuItem>
          <MenuItem>
            <Link
              className={classes.mobileNavItem}
              href="https://content.prereview.org/resources/"
            >
              Resources
            </Link>
          </MenuItem>
          <MenuItem>
            <Link className={classes.mobileNavItem} href="/communities">
              Communities
            </Link>
          </MenuItem>
          <MenuItem>
            <Link
              className={classes.mobileNavItem}
              href="https://content.prereview.org/blog/"
            >
              Blog
            </Link>
          </MenuItem>
          <MenuItem className={classes.mobileNavItem}>About</MenuItem>
          <MenuItem className={classes.nested}>
            <Link className={classes.mobileNavItem} href="#FIXME">
              Mission
            </Link>
          </MenuItem>
          <MenuItem className={classes.nested}>
            <Link className={classes.mobileNavItem} href="#FIXME">
              Team
            </Link>
          </MenuItem>
          <MenuItem className={classes.nested}>
            <Link className={classes.mobileNavItem} href="#FIXME">
              How we are funded
            </Link>
          </MenuItem>
          <MenuItem className={classes.nested}>
            <Link
              className={classes.mobileNavItem}
              href="https://content.prereview.org/coc"
            >
              Code of Conduct
            </Link>
          </MenuItem>
          <MenuItem>
            <Link
              className={classes.mobileNavItem}
              href="https://codeforscience.org/donate/prereview/"
            >
              Donate
            </Link>
          </MenuItem>
        </Menu>

        <Grid
          container
          alignItems="center"
          justify="flex-end"
          spacing={2}
          className={classes.nav}
        >
          <Grid item>
            <Link
              className={classes.navItem}
              color="textPrimary"
              href="/reviews"
            >
              Preprint Review Platform
            </Link>
          </Grid>
          <Grid item>
            <Button
              aria-controls="programs-menu"
              aria-haspopup="true"
              onClick={handleClickPrograms}
              className={classes.navItem}
            >
              Programs
            </Button>
            <Menu
              id="programs-menu"
              anchorEl={programsEl}
              keepMounted
              open={Boolean(programsEl)}
              onClose={handleClickPrograms}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <MenuItem onClick={handleClickPrograms}>Open Reviewers</MenuItem>
              <MenuItem onClick={handleClickPrograms}>LivePREJCs</MenuItem>
            </Menu>
          </Grid>
          <Grid item>
            <Link
              className={classes.navItem}
              color="textPrimary"
              href="https://content.prereview.org/resources"
            >
              Resources
            </Link>
          </Grid>
          <Grid item>
            <Link
              className={classes.navItem}
              color="textPrimary"
              href="/communities"
            >
              Communities
            </Link>
          </Grid>
          <Grid item>
            <Link
              className={classes.navItem}
              color="textPrimary"
              href="https://content.prereview.org/blog"
            >
              Blog
            </Link>
          </Grid>
          <Grid item>
            <Button
              aria-controls="programs-menu"
              aria-haspopup="true"
              onClick={handleClickAbout}
              className={classes.navItem}
            >
              About
            </Button>
            <Menu
              id="about-menu"
              anchorEl={aboutEl}
              keepMounted
              open={Boolean(aboutEl)}
              onClose={handleClickAbout}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <MenuItem onClick={handleClickAbout}>Mission</MenuItem>
              <MenuItem onClick={handleClickAbout}>Team</MenuItem>
              <MenuItem onClick={handleClickAbout}>How we are funded</MenuItem>
              <MenuItem onClick={handleClickAbout}>Code of Conduct</MenuItem>
            </Menu>
          </Grid>
          <Grid item>
            <Link
              className={classes.navItem}
              color="textPrimary"
              href="https://codeforscience.org/donate/prereview/"
            >
              Donate
            </Link>
          </Grid>
        </Grid>
        <span className={classes.userBadge}>
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
    </Box>
  );
}

HeaderBar.propTypes = {
  thisUser: PropTypes.object,
};
