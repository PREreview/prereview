// base imports
import React from 'react';

// material ui imports
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  announcement: {
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: '1rem',
    textAlign: 'center',
  },
  link: {
    color: `${theme.palette.primary.contrastText} !important`,
    textDecoration: 'underline',
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },
}));

export default function Banner() {
  const classes = useStyles();

  return (
    <>
      <Box className={classes.announcement}>
        <Container>
          <Typography component="div">
            Get involved with rapidly reviewing COVID-19 preprints and then view
            our{' '}
            <Link
              className={classes.link}
              href={`/dashboard?limit=10&offset=0&search=covid-19`}
            >
              COVID-19 Dashboard
            </Link>{' '}
            of review activities and recommendations.
          </Typography>
        </Container>
      </Box>
    </>
  );
}
