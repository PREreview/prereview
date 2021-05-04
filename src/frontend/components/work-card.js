// base imports
import React from 'react';
import { format } from 'date-fns';

// Material UI components
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

// icons
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

const useStyles = makeStyles(theme => ({
  button: {
    color: '#000 !important',
    fontSize: '1.2rem',
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  date: {
    color: theme.palette.secondary.main,
    fontSize: '1.2rem',
    textAlign: 'right',
  },
  gridMain: {
    borderBottom: `1px solid ${theme.palette.secondary.light}`,
    cursor: 'pointer',
    padding: 20,
  },
  gridSecondary: {},
  icon: {
    color: theme.palette.secondary.main,
    height: 30,
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 30,
  },
  meta: {
    color: theme.palette.secondary.main,
    fontSize: '0.9rem',
  },
  paper: {
    borderBottom: `2px solid ${theme.palette.secondary.light}`,
    marginBottom: 10,
    width: '100%',
  },
  publication: {
    color: theme.palette.primary.main,
    fontSize: '0.9rem',
    fontWeight: 700,
    paddingRight: 40,
    position: 'relative',
  },
  title: {
    color: '#000 !important',
    display: 'block',
    fontSize: '1.3rem',
    fontWeight: 700,
    marginBottom: 10,
  },
}));

export default function WorkCard({ work }) {
  const classes = useStyles();

  const doiExists = work.handle && work.handle.split(':')[0] === 'doi';
  let workDoi;
  doiExists ? (workDoi = work.handle.split(':')[1]) : null;

  const getWorkUrl = () => {
    if (work.url) return work.url;
    if (workDoi) return `https://doi.org/${work.handle.split(':')[1]}`;
    return null;
  };

  return (
    <Card key={work.uuid}>
      <CardContent>
        <Grid
          container
          direction="row-reverse"
          justifycontent="space-between"
          spacing={0}
          className={classes.gridMain}
        >
          <Grid item xs={12} sm={4}>
            <Typography className={classes.date}>
              {format(new Date(work.publicationDate), 'yyyy/MM/dd')}{' '}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography>
              <Link
                href={getWorkUrl()}
                rel="noopener noreferrer"
                target="_blank"
                className={classes.title}
              >
                {work.title}
              </Link>
            </Typography>
            {work.publisher ? (
              <Typography className={classes.publication}>
                {work.publisher}
              </Typography>
            ) : null}{' '}
            {doiExists && workDoi ? (
              <>
                <ChevronRightIcon className={classes.icon} />
                <Typography className={classes.meta}>
                  <Link
                    href={`https://doi.org/${workDoi}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {work.handle}
                  </Link>
                </Typography>
              </>
            ) : (
              <>
                <ChevronRightIcon className={classes.icon} />
                <Typography>
                  <span className={classes.meta}>{work.handle}</span>
                </Typography>
              </>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
