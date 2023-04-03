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
import preReviewLogo from '../assets/images/prereview-logo.svg';

// icons
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

const useStyles = makeStyles(() => ({
  footerNav: {
    height: 220,
    marginTop: '2rem',
  },
  footerNavItem: {
    color: '#000 !important', // #FIXME remove after porting to MUI
    fontSize: '1.25rem',
  },
  img: {
    display: 'block',
    maxWidth: 300,
    width: '100%',
  },
  signUp: {
    color: '#fff !important',
    display: 'inline-block',
    fontSize: '2rem',
    marginBottom: 30,
    marginTop: 30,
    position: 'relative',
  },
  signUpIcon: {
    position: 'absolute',
    right: '-30px',
    top: '55%',
    transform: 'translateY(-50%)',
  },
}));

export default function Footer() {
  const classes = useStyles();

  return (
    <Box>
      <Grid container>
        <Grid item xs={12} md={4}>
          <Box pt={3} px={3} borderTop="1px solid #54948E">
            <Link to="/" href={'https://prereview.org'}>
              <img src={preReviewLogo} className={classes.img} />
              <Typography component="span" variant="srOnly">
                PREreview home
              </Typography>
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
                  href="https://content.prereview.org/mission"
                >
                  Mission
                </Link>
              </Grid>
              <Grid item>
                <Link
                  className={classes.footerNavItem}
                  href="https://content.prereview.org/people"
                >
                  People
                </Link>
              </Grid>
              <Grid item>
                <Link
                  className={classes.footerNavItem}
                  href="https://content.prereview.org/funding"
                >
                  Funding
                </Link>
              </Grid>
              <Grid item>
                <Link
                  className={classes.footerNavItem}
                  color="textPrimary"
                  href="https://donorbox.org/prereview"
                >
                  Donate
                </Link>
              </Grid>
              <Grid item>
                <Link
                  className={classes.footerNavItem}
                  color="textPrimary"
                  href="https://content.prereview.org"
                >
                  Blog
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
                  href="https://content.prereview.org/privacypolicy"
                >
                  Privacy Policy
                </Link>
              </Grid>
              <Grid item>
                <Link
                  className={classes.footerNavItem}
                  color="textPrimary"
                  href="https://content.prereview.org/api"
                >
                  API
                </Link>
              </Grid>
              <Grid item>
                <Link
                  className={classes.footerNavItem}
                  color="textPrimary"
                  href="https://github.com/PREreview/prereview"
                >
                  GitHub
                </Link>
              </Grid>
              <Grid item>
                <Link
                  className={classes.footerNavItem}
                  color="textPrimary"
                  href="mailto:contact@prereview.org"
                >
                  Contact
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
                <Link
                  className={classes.footerNavItem}
                  href="https://content.prereview.org/programs"
                >
                  Programs
                </Link>
              </Grid>
              <Grid item>
                <Link className={classes.footerNavItem} href="/communities">
                  Communities
                </Link>
              </Grid>
              <Grid item>
                <Link
                  className={classes.footerNavItem}
                  href="https://content.prereview.org/resources"
                >
                  Resource Center
                </Link>
              </Grid>
            </Grid>
            <Box borderTop="1px solid #000" mt={2} py={2}>
              <Typography>
                <em>
                  Except where otherwise noted, content on this site is licensed
                  under a{' '}
                  <Link href="https://creativecommons.org/licenses/by/4.0/">
                    Creative Commons Attribution 4.0 International license
                  </Link>
                  . All project and service logos, images, videos, and brands
                  are property of their respective owners and should not be
                  reused without permission, except where otherwise noted. Icons
                  by The Noun Project.
                </em>
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box bgcolor="#54948E" color="#fff" p={8} height="85%">
            <Typography variant="h4" component="h2" gutterBottom>
              Stay Connected.
            </Typography>
            <Typography component="div" gutterBottom>
              <Link
                href="https://prereview.civicrm.org/civicrm/mailing/url?u=17&qid=30"
                className={classes.signUp}
              >
                Sign up for our newsletter
                <ArrowForwardIosIcon className={classes.signUpIcon} />
              </Link>
            </Typography>
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
          <Box borderTop="1px solid #54948E" height="700px">
            <TwitterTimelineEmbed
              sourceType="profile"
              screenName="PREreview_"
              autoHeight
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
