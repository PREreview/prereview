// base imports
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { Helmet } from 'react-helmet-async';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import { useGetPreprint } from '../hooks/api-hooks.tsx';
import { useExtension } from '../hooks/extension-hooks';

// utils
import { getCanonicalUrl } from '../utils/preprints';

// Material UI imports
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

// icons
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// components
import HeaderBar from './header-bar';
import Link from '@material-ui/core/Link';
import Loading from './loading';
import NotFound from './not-found';
import ShellContent from './shell-content';

// constants
import { ORG } from '../constants';

const drawerWidth = '40vw';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
  },
  appBarContent: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    paddingLeft: 0,
    paddingRight: 0,
    width: '100%',
  },
  appBarShift: {
    marginRight: drawerWidth,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    width: `calc(100% - ${drawerWidth})`,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  drawer: {
    flexShrink: 0,
    width: drawerWidth,
  },
  drawerOpen: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    width: drawerWidth,
  },
  drawerClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  headerBarFull: {
    width: `calc(100% - 74px)`,
  },
  headerBarCondensed: {
    width: `100%`,
  },
  hide: {
    display: 'none',
  },
  menuButton: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  object: {
    height: '100vh',
    width: '100%',
  },
  toolbar: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    // ...theme.mixins.toolbar,
  },
}));

export default function ExtensionFallback() {
  const classes = useStyles();
  const { id, cid } = useParams();
  const location = useLocation(); // location.state can be {preprint, tab} with tab being `request` or `review` (so that we know on which tab the shell should be activated with
  const theme = useTheme();
  const appBarElement = useRef(null);

  const [user] = useContext(UserProvider.context);

  const [authors, setAuthors] = useState(null);
  const [height, setHeight] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);
  const [preprint, setPreprint] = useState(null);

  const { data: preprintData, loadingPreprint, errorPreprint } = useGetPreprint(
    { id: id },
  );

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  useExtension(preprint && id);

  useEffect(() => {
    appBarElement && appBarElement.current
      ? setHeight(appBarElement.current.clientHeight)
      : null;
  }, [appBarElement.current]);

  useEffect(() => {
    if (!loadingPreprint) {
      if (preprintData) {
        setPreprint(preprintData.data[0]);
        setLoading(false);
      }
    }
  }, [loadingPreprint, preprintData]);

  const pdfUrl = preprint ? preprint.contentUrl : '';
  const canonicalUrl = getCanonicalUrl(preprint ? preprint : null);

  useEffect(() => {
    if (preprint && preprint.authors) {
      const string = preprint.authors.replace(/[|&;$%@"<>()\[\]+]/g, '');
      setAuthors(string);
    }
  }, [preprint]);

  if (loading) {
    return <Loading />;
  } else if (errorPreprint) {
    return <NotFound />;
  } else {
    return (
      <>
        <Helmet>
          <title>
            {id} • {ORG}
          </title>
        </Helmet>
        <div className={classes.root}>
          <CssBaseline />
          <AppBar
            ref={appBarElement}
            color="default"
            position="fixed"
            className={clsx(classes.appBar, {
              [classes.appBarShift]: open,
            })}
          >
            <Toolbar className={classes.appBarContent}>
              <Box
                className={
                  open ? classes.headerBarCondensed : classes.headerBarFull
                }
              >
                <HeaderBar thisUser={user} />
              </Box>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="end"
                className={clsx(classes.menuButton, {
                  [classes.hide]: open,
                })}
              >
                <MenuOpenIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          <main className={classes.content} style={{ marginTop: height}}>
            <div className={classes.toolbar} />
            <object
              key={pdfUrl}
              data={pdfUrl}
              className={classes.object}
              // type="application/pdf" commented out as it seems to break pdf loading in safari
              // typemustmatch="true" commented out as it doesn't seem to be currently supported by react
            >
              {/* fallback text in case we can't load the PDF */}
              <Box>
                <Typography component="h2" variant="h2" gutterBottom>
                  {preprint.title}
                </Typography>
                <Typography component="div" variant="h4" gutterBottom>
                  {authors}
                </Typography>
                <Typography component="h3" variant="h3">
                  Abstract
                </Typography>
                <Typography component="div" variant="body2" gutterBottom>
                  <div
                    dangerouslySetInnerHTML={{ __html: preprint.abstractText }}
                  />
                </Typography>
                {!!canonicalUrl && (
                  <Typography component="div" variant="body1">
                    You can access the{' '}
                    {
                      <Link
                        href={canonicalUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        full text of this preprint
                      </Link>
                    }{' '}
                    at the preprint server&apos;s website.
                  </Typography>
                )}
              </Box>
            </object>
          </main>
          <Drawer
            variant="permanent"
            anchor="right"
            className={clsx(classes.drawer, {
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            })}
            classes={{
              paper: clsx({
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
              }),
            }}
          >
            <div className={classes.toolbar}>
              <IconButton onClick={handleDrawerClose}>
                {theme.direction === 'ltr' ? (
                  <ChevronRightIcon />
                ) : (
                  <ChevronLeftIcon />
                )}
              </IconButton>
            </div>
            <Divider />
            <ShellContent
              cid={cid}
              preprint={preprint}
              user={user}
              defaultTab={location.state && location.state.tab}
            />
          </Drawer>
        </div>
      </>
    );
  }
}
