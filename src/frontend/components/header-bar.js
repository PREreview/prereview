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
import Typography from '@material-ui/core/Typography';

// components
import Banner from './banner';
import JoinModal from './join-modal';
import LoginModal from './login-modal';
import UserBadge from './user-badge';

// utils
import { checkIfProfileNeedsUpdate } from '../utils/roles';

// icons
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import MenuIcon from '@material-ui/icons/Menu';
import preReviewLogo from '../svgs/prereview-logo.svg';

const useStyles = makeStyles(theme => ({
  content: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem',
  },
  headerBar: {
    boxShadow: '0 0 5px #000',
    position: 'relative',
    zIndex: 1,
  },
  img: {
    display: 'block',
    maxWidth: 200,
    width: '100%',
  },
  mobileNav: {
    marginLeft: 'auto',
    [theme.breakpoints.up('lg')]: {
      display: 'none',
    },
  },
  mobileNavItem: {
    color: '#000 !important', // #FIXME remove after porting to MUI
  },
  nav: {
    marginRight: '1rem',
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  navItem: {
    color: '#000 !important', // #FIXME remove after porting to MUI
    fontSize: '1.2rem',
    fontWeight: 400,
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
  subnavItem: {
    color: '#000 !important',
    fontSize: '1rem',
  },
  userBadge: {
    minWidth: 165,
  },
}));

export default function HeaderBar({ thisUser }) {
  const classes = useStyles();
  const showProfileNotice = checkIfProfileNeedsUpdate(thisUser);

  const [loginLink, setLoginLink] = useState('/login');
  const [homeLink, setHomeLink] = useState('/');

  // handle login modal
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  const handleJoinModalToggle = next => {
    if (next === 'next') {
      handleLoginModalToggle();
    }
    setJoinModalOpen(joinModalOpen => !joinModalOpen);
  };

  const handleLoginModalToggle = () => {
    setLoginModalOpen(loginModalOpen => !loginModalOpen);
  };

  /* Handle popper menus */
  // #FIXME refactor
  const [aboutEl, setAboutEl] = useState(null);
  const [mobileEl, setMobileEl] = useState(null);
  const [platformEl, setPlatformEl] = useState(null);
  const [programsEl, setProgramsEl] = useState(null);
  const [resourcesEl, setResourcesEl] = useState(null);

  const handleClickAbout = event => {
    setAboutEl(aboutEl ? null : event.currentTarget);
  };

  const handleClickMobile = event => {
    setMobileEl(mobileEl ? null : event.currentTarget);
  };

  const handleClickPlatform = event => {
    setPlatformEl(platformEl ? null : event.currentTarget);
  };

  const handleClickPrograms = event => {
    setProgramsEl(programsEl ? null : event.currentTarget);
  };

  const handleClickResources = event => {
    setResourcesEl(resourcesEl ? null : event.currentTarget);
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
        <Grid container alignItems="center" justify="space-between" spacing={2}>
          <Grid item xs={8} sm={10} md={2}>
            <Box className={classes.logo}>
              <Typography component="h1" variant="srOnly">
                <Link to="/" href={homeLink}>
                  PREreview
                </Link>
              </Typography>
              <Link to="/" href={homeLink}>
                <img src={preReviewLogo} className={classes.img} />
                <Typography component="span" variant="srOnly">
                  PREreview home
                </Typography>
              </Link>
            </Box>
          </Grid>
          <Grid
            container
            item
            alignItems="center"
            justify="flex-end"
            spacing={1}
            xs={4}
            sm={2}
            md={10}
          >
            <Grid item>
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
                <MenuItem className={classes.mobileNavItem}>
                  Preprint Review Platform
                </MenuItem>
                <MenuItem className={classes.nested}>
                  <Link
                    className={classes.mobileNavItem}
                    href="https://content.prereview.org/about-the-platform"
                  >
                    How it works
                  </Link>
                </MenuItem>
                <MenuItem className={classes.nested}>
                  <Link className={classes.mobileNavItem} href="/reviews">
                    Go to platform
                  </Link>
                </MenuItem>
                <MenuItem className={classes.mobileNavItem}>Programs</MenuItem>
                <MenuItem className={classes.nested}>
                  <Link
                    className={classes.mobileNavItem}
                    href="https://content.prereview.org/openreviewers"
                  >
                    Open Reviewers
                  </Link>
                </MenuItem>
                <MenuItem className={classes.nested}>
                  <Link
                    className={classes.mobileNavItem}
                    href="https://content.prereview.org/liveprejcs"
                  >
                    LivePREJCs
                  </Link>
                </MenuItem>
                <MenuItem className={classes.mobileNavItem}>Resources</MenuItem>
                <MenuItem className={classes.nested}>
                  <Link
                    className={classes.mobileNavItem}
                    href="https://content.prereview.org/resources"
                  >
                    Resource Center
                  </Link>
                </MenuItem>
                <MenuItem className={classes.nested}>
                  <Link
                    className={classes.mobileNavItem}
                    href="https://content.prereview.org/api"
                  >
                    API
                  </Link>
                </MenuItem>
                <MenuItem className={classes.nested}>
                  <Link
                    className={classes.mobileNavItem}
                    href="https://github.com/PREreview/prereview"
                  >
                    GitHub
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
                    href="https://content.prereview.org"
                  >
                    Blog
                  </Link>
                </MenuItem>
                <MenuItem className={classes.mobileNavItem}>About</MenuItem>
                <MenuItem className={classes.nested}>
                  <Link
                    className={classes.mobileNavItem}
                    href="https://content.prereview.org/mission"
                  >
                    Mission
                  </Link>
                </MenuItem>
                <MenuItem className={classes.nested}>
                  <Link
                    className={classes.mobileNavItem}
                    href="https://content.prereview.org/people"
                  >
                    People
                  </Link>
                </MenuItem>
                <MenuItem className={classes.nested}>
                  <Link
                    className={classes.mobileNavItem}
                    href="https://content.prereview.org/funding"
                  >
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
                <MenuItem className={classes.nested}>
                  <Link
                    className={classes.mobileNavItem}
                    href="https://content.prereview.org/privacypolicy"
                  >
                    Privacy Policy
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
                {!thisUser ? (
                  <MenuItem>
                    <Link
                      className={classes.mobileNavItem}
                      href="#"
                      onClick={handleJoinModalToggle}
                    >
                      Log in / Sign up
                    </Link>
                    <JoinModal
                      open={joinModalOpen}
                      handleClose={handleJoinModalToggle}
                    />
                    <LoginModal
                      open={loginModalOpen}
                      handleClose={handleLoginModalToggle}
                    />
                  </MenuItem>
                ) : null}
              </Menu>

              <Grid
                container
                alignItems="center"
                justify="flex-end"
                spacing={2}
                className={classes.nav}
              >
                <Grid item>
                  <Button
                    aria-controls="platform-menu"
                    aria-haspopup="true"
                    onClick={handleClickPlatform}
                    className={classes.navItem}
                  >
                    Preprint Review Platform
                  </Button>
                  <Menu
                    id="platform-menu"
                    anchorEl={platformEl}
                    keepMounted
                    open={Boolean(platformEl)}
                    onClose={handleClickPlatform}
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
                    <MenuItem onClick={handleClickPlatform}>
                      <Link
                        className={classes.subnavItem}
                        color="textPrimary"
                        href="https://content.prereview.org/about-the-platform"
                      >
                        How it works
                      </Link>
                    </MenuItem>
                    <MenuItem onClick={handleClickPlatform}>
                      <Link
                        className={classes.subnavItem}
                        color="textPrimary"
                        href="/reviews"
                      >
                        Go to platform
                      </Link>
                    </MenuItem>
                  </Menu>
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
                    <MenuItem onClick={handleClickPrograms}>
                      <Link
                        className={classes.subnavItem}
                        color="textPrimary"
                        href="https://content.prereview.org/openreviewers"
                      >
                        Open Reviewers
                      </Link>
                    </MenuItem>
                    <MenuItem onClick={handleClickPrograms}>
                      <Link
                        className={classes.subnavItem}
                        color="textPrimary"
                        href="https://content.prereview.org/liveprejcs"
                      >
                        LivePREJCs
                      </Link>
                    </MenuItem>
                  </Menu>
                </Grid>
                <Grid item>
                  <Button
                    aria-controls="resources-menu"
                    aria-haspopup="true"
                    onClick={handleClickResources}
                    className={classes.navItem}
                  >
                    Resources
                  </Button>
                  <Menu
                    id="resources-menu"
                    anchorEl={resourcesEl}
                    keepMounted
                    open={Boolean(resourcesEl)}
                    onClose={handleClickResources}
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
                    <MenuItem onClick={handleClickResources}>
                      <Link
                        className={classes.subnavItem}
                        color="textPrimary"
                        href="https://content.prereview.org/resources"
                      >
                        Resource Center
                      </Link>
                    </MenuItem>
                    <MenuItem onClick={handleClickResources}>
                      <Link
                        className={classes.subnavItem}
                        color="textPrimary"
                        href="https://content.prereview.org/api"
                      >
                        API
                      </Link>
                    </MenuItem>
                    <MenuItem onClick={handleClickResources}>
                      <Link
                        className={classes.subnavItem}
                        color="textPrimary"
                        href="https://github.com/PREreview/prereview"
                      >
                        GitHub
                      </Link>
                    </MenuItem>
                  </Menu>
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
                    href="https://content.prereview.org"
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
                    <MenuItem onClick={handleClickAbout}>
                      <Link
                        className={classes.subnavItem}
                        color="textPrimary"
                        href="https://content.prereview.org/mission"
                      >
                        Mission
                      </Link>
                    </MenuItem>
                    <MenuItem onClick={handleClickAbout}>
                      <Link
                        className={classes.subnavItem}
                        color="textPrimary"
                        href="https://content.prereview.org/people"
                      >
                        People
                      </Link>
                    </MenuItem>
                    <MenuItem onClick={handleClickAbout}>
                      <Link
                        className={classes.subnavItem}
                        color="textPrimary"
                        href="https://content.prereview.org/funding"
                      >
                        How we are funded
                      </Link>
                    </MenuItem>
                    <MenuItem onClick={handleClickAbout}>
                      <Link
                        className={classes.subnavItem}
                        color="textPrimary"
                        href="https://content.prereview.org/coc"
                      >
                        Code of Conduct
                      </Link>
                    </MenuItem>
                    <MenuItem onClick={handleClickAbout}>
                      <Link
                        className={classes.subnavItem}
                        color="textPrimary"
                        href="https://content.prereview.org/privacypolicy"
                      >
                        Privacy Policy
                      </Link>
                    </MenuItem>
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
                {!thisUser ? (
                  <Grid item>
                    <Button
                      aria-controls="login-modal"
                      aria-haspopup="true"
                      onClick={handleJoinModalToggle}
                      className={classes.navItem}
                    >
                      Log in / Sign up
                    </Button>
                  </Grid>
                ) : null}
              </Grid>
            </Grid>

            <Grid item>
              <span className={classes.userBadge}>
                {thisUser ? (
                  <UserBadge user={thisUser} showNotice={showProfileNotice}>
                    {showProfileNotice && (
                      <Link
                        href={`/about/${thisUser.defaultPersona.uuid}`}
                        target={process.env.IS_EXTENSION ? '_blank' : undefined}
                      >
                        <span>
                          Complete Profile <ErrorOutlineIcon />
                        </span>
                      </Link>
                    )}

                    <Link
                      to={
                        process.env.IS_EXTENSION ? undefined : '/settings/api'
                      }
                      href={`/settings/api`}
                      target={process.env.IS_EXTENSION ? '_blank' : undefined}
                    >
                      API Settings
                    </Link>

                    <Link
                      to={
                        process.env.IS_EXTENSION
                          ? undefined
                          : '/settings/drafts'
                      }
                      href={`/settings/drafts`}
                      target={process.env.IS_EXTENSION ? '_blank' : undefined}
                    >
                      User Drafts
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
                ) : null}
              </span>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

HeaderBar.propTypes = {
  thisUser: PropTypes.object,
};
