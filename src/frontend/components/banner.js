// base imports
import React from 'react';

// material ui imports
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  announcement: {
    background: theme.palette.primary.main,
    color: theme.palette.background.default,
    padding: '1rem',
    textAlign: 'center',
  },
}));

export default function Banner() {
  const classes = useStyles();

  return (
    <>
      <Box className={classes.announcement}>
        <Container>
          <Typography variant="body1" component="div">
            Get involved with rapidly reviewing COVID-19 preprints and then view
            our{' '}
            <a
              className="announcement-link"
              href={`/dashboard?limit=10&offset=0&search=covid-19`}
            >
              COVID-19 Dashboard
            </a>{' '}
            of review activities and recommendations.
          </Typography>
          <Typography variant="body1" component="div">
            Read about the{' '}
            <a
              className="announcement-link"
              href="https://oaspa.org/covid-19-publishers-open-letter-of-intent-rapid-review/?highlight=covid-19"
              target="_blank"
              rel="noreferrer"
            >
              OASPA’s initiative
            </a>{' '}
            to ensure rapid review of key COVID-19 work.
          </Typography>
        </Container>
      </Box>
    </>
  );
}
