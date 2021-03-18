// base imports
import React from 'react';
import { TwitterTimelineEmbed } from 'react-twitter-embed';

// Material UI imports
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

// site logo
import PreReviewLogo from './pre-review-logo';

const useStyles = makeStyles(() => ({
  footerNav: {
    height: 200,
    marginBottom: '2rem',
    marginTop: '2rem',
  },
  footerNavItem: {
    color: '#000 !important', // #FIXME remove after porting to MUI
    fontSize: '1.25rem',
  },
  img: {
    display: 'block',
    width: '100%',
  },
}));

export default function Footer() {
  const classes = useStyles();

  return (
    <Box>
      <Grid container>
        <Grid item xs={12} md={4}>
          <Box p={3} borderTop="1px solid #54948E">
            <Link to="/" href={'https://prereview.org'}>
              <PreReviewLogo />
            </Link>
            <Grid
              container
              direction="column"
              spacing={2}
              justify="space-between"
              className={classes.footerNav}
            >
              <Grid item>
                <Link
                  className={classes.footerNavItem}
                  href="https://content.prereview.org/about/"
                >
                  About
                </Link>
              </Grid>
              <Grid item>
                <Link className={classes.footerNavItem} href="#FIXME">
                  Team
                </Link>
              </Grid>
              <Grid item>
                <Link
                  className={classes.footerNavItem}
                  color="textPrimary"
                  href="https://content.prereview.org/blog"
                >
                  Blog
                </Link>
              </Grid>
              <Grid item>
                <Link
                  className={classes.footerNavItem}
                  color="textPrimary"
                  href="https://codeforscience.org/donate/prereview/"
                >
                  Donate
                </Link>
              </Grid>
              <Grid item>
                <Link
                  className={classes.footerNavItem}
                  color="textPrimary"
                  href="https://content.prereview.org/contact"
                >
                  Contact
                </Link>
              </Grid>
              <Grid item>
                <Link
                  className={classes.footerNavItem}
                  color="textPrimary"
                  href="https://content.prereview.org/coc"
                >
                  Code of Conduct
                </Link>
              </Grid>
              <Grid item>
                <Link
                  className={classes.footerNavItem}
                  color="textPrimary"
                  href="#FIXME"
                >
                  Privacy Policy
                </Link>
              </Grid>
              <Grid item>
                <Link
                  className={classes.footerNavItem}
                  color="textPrimary"
                  href="#FIXME"
                >
                  Terms
                </Link>
              </Grid>
              <Grid item>
                <Link
                  className={classes.footerNavItem}
                  color="textPrimary"
                  href="/api/docs"
                >
                  API
                </Link>
              </Grid>
              <Grid item>
                <Link
                  className={classes.footerNavItem}
                  color="textPrimary"
                  href="https://github.com/PREreview/"
                >
                  GitHub
                </Link>
              </Grid>
            </Grid>
            <Grid
              container
              direction="column"
              spacing={2}
              className={classes.footerNav}
            >
              <Grid item>
                <Link className={classes.footerNavItem} href="/reviews">
                  Preprint Review Platform
                </Link>
              </Grid>
              <Grid item>
                <Link className={classes.footerNavItem} href="#FIXME">
                  Programs
                </Link>
              </Grid>
              <Grid item>
                <Link
                  className={classes.footerNavItem}
                  href="https://content.prereview.org/resources"
                >
                  Resources
                </Link>
              </Grid>
            </Grid>
            <Box borderTop="1px solid #000" mt={2} pt={2}>
              <Typography>
                <em>
                  This content is available under a Creative Commons Attribution
                  License.
                </em>
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box bgcolor="#54948E" color="#fff" p={8} height="80%">
            <Typography variant="h4" component="h2" gutterBottom>
              Stay Connected.
            </Typography>
            {/* FIXME need sign up for embed*/}
            <img src="http://satyr.io/400x60/white" className={classes.img} />
            <Typography variant="h5" component="div">
              <em>
                By providing your email address, you are opting in to receive
                communications about PREreview. All data is subject to the
                PREreview privacy policy. Please contact contact@prereview.org
                with any questions.
              </em>
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <TwitterTimelineEmbed
            sourceType="profile"
            screenName="PREreview_"
            options={{ height: 600 }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
