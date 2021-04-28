// base imports
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';

// Material UI components
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

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

  const doi = work.handle && work.handle.split(':')[0] === 'doi';

  const getWorkUrl = () => {
    if (work.url) return work.url;
    if (doi) return `https://doi.org/${work.handle.split(':')[1]}`;
    return '';
  };

  return (
    <Card key={work.uuid}>
      <CardContent>
        <Typography className={classes.title}>
          <Link href={getWorkUrl()}>{work.title}</Link>
        </Typography>
        {doi ? <Typography>DOI: {doi}</Typography> : null}
        {work.publisher ? (
          <Typography classNames={classes.publication}>Published in: {work.publisher}</Typography>
        ) : null}
        <Typography>
          Published on: {format(new Date(work.publicationDate), 'yyyy/MM/dd')}
        </Typography>
      </CardContent>
    </Card>
  );
}
