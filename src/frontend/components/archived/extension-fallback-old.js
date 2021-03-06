// base imports
import React, { Suspense, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Cookies from 'js-cookie';
import mobile from 'is-mobile';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import { useGetPreprint } from '../hooks/api-hooks.tsx';
import { useExtension } from '../hooks/extension-hooks';

// utils
import { createPreprintId } from '../utils/ids';
import { getCanonicalUrl } from '../utils/preprints';
import { unprefix } from '../utils/jsonld';

// Material UI components
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

// components
import Loading from './loading';
import NotFound from './not-found';
import Shell from './shell';
import ShellContent from './shell-content';

// constants
import { ORG } from '../constants';

const useStyles = makeStyles(() => ({
  grid: {},
  object: {
    height: '100%',
    width: '100%',
  },
}));

// TODO? if no PDF is available display shell in full screen ?

export default function ExtensionFallback() {
  const classes = useStyles();
  const location = useLocation(); // location.state can be {preprint, tab} with tab being `request` or `review` (so that we know on which tab the shell should be activated with
  const [user] = useContext(UserProvider.context);

  const [loading, setLoading] = useState(true);
  const [preprint, setPreprint] = useState(null);
  const [authors, setAuthors] = useState(null);

  const { id, cid } = useParams();

  const { data: preprintData, loadingPreprint, errorPreprint } = useGetPreprint({id: id});

  useEffect(() => {
    if (!loadingPreprint) {
      if (preprintData) {
        setPreprint(preprintData.data[0]);
        setLoading(false);
      }
    }
  }, [loadingPreprint, preprintData]);

  const isMobile = useMemo(() => mobile({ tablet: true }), []);

  // See https://github.com/PREreview/rapid-prereview/issues/13
  // Drag and drop over a PDF object is currently broken in Chrome for Mac
  // Bug is tracked here: https://bugs.chromium.org/p/chromium/issues/detail?id=984891&q=drag%20object&colspec=ID%20Pri%20M%20Stars%20ReleaseBlock%20Component%20Status%20Owner%20Summary%20OS%20Modified
  const [isChromeOnMac, setIsChroneOnMac] = useState(false);

  useExtension(preprint && id);

  const pdfUrl = preprint ? preprint.contentUrl : '';
  const canonicalUrl = getCanonicalUrl(preprint ? preprint : null);

  useEffect(() => {
    if (preprint && preprint.authors) {
      const string = preprint.authors.replace(/[|&;$%@"<>()\[\]+]/g, "");
      setAuthors(string);
    }

  }, [preprint]);

  useEffect(() => {
    if (window) {
      setIsChroneOnMac(!!window.chrome && navigator.platform.includes('Mac'));
    }
  }, []);

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
        <Grid container spacing={0} className={classes.grid}>
          <Grid item xs={12} md={7}>
            <object
              key={pdfUrl}
              data={pdfUrl}
              className={classes.object}
              // type="application/pdf" commented out as it seems to break pdf loading in safari
              // typemustmatch="true" commented out as it doesn't seem to be currently supported by react
            >
              {/* fallback text in case we can't load the PDF */}
              <Box>
                <Typography component="h2" variant="h2" gutterBottom>{preprint.title}</Typography>
                <Typography component="div" variant="h4" gutterBottom>{authors}</Typography>
                <Typography component="h3" variant="h3">Abstract</Typography>
                <Typography component="div" variant="body2" gutterBottom>
                  <div dangerouslySetInnerHTML={{ __html: preprint.abstractText }} />
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
                    at the preprint server's website.
                  </Typography>
                )}
              </Box>
            </object>
          </Grid>
          <Grid item xs={12} md={5}>
            <Shell>
              {onRequireScreen =>
                !!preprint && (
                  <ShellContent
                    cid={cid}
                    onRequireScreen={onRequireScreen}
                    preprint={preprint}
                    user={user}
                    defaultTab={location.state && location.state.tab}
                  />
                )
              }
            </Shell>
          </Grid>
        </Grid>
      </>
    );
  }
}
