// base imports
import React from 'react';
import PropTypes from 'prop-types';

// Material-ui components
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';

import Avatar from './avatar';

const useStyles = makeStyles(theme => ({
  card: {},
  header: {},
  content: {},
  avatar: {
    width: theme.spacing(10),
    height: theme.spacing(10),
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: theme.spacing(2),
  },
}));

export default function PersonaCard({ persona }) {
  const classes = useStyles();

  console.log('persona:', persona);

  return (
    <Card className={classes.card}>
      <Grid container>
        <CardHeader
          className={classes.header}
          title={persona.name}
          avatar={
            <Avatar
              avatar={persona.avatar}
              email={persona.email}
              alt={persona.name}
              className={classes.avatar}
            />
          }
        />
        <CardContent className={classes.content}>
          <Grid container>
            {persona && persona.badges.length > 0 && (
              <Grid item>
                <dd>
                  {persona.badges.map(badge => (
                    <Chip
                      key={badge.uuid}
                      label={badge.name}
                      color="primary"
                      size="small"
                    />
                  ))}
                </dd>
              </Grid>
            )}
            {persona && persona.communities.length > 0 && (
              <Grid item>
                <dd>
                  {persona.communities.map(community => (
                    <Chip
                      key={community.uuid}
                      label={community.name}
                      color="secondary"
                      size="small"
                    />
                  ))}
                </dd>
              </Grid>
            )}
            <Grid item>
              {persona.requests && Array.isArray(persona.requests)
                ? persona.requests.length
                : 0}
            </Grid>
            <Grid item>
              {persona.rapidReviews && Array.isArray(persona.rapidReviews)
                ? persona.rapidReviews.length
                : 0}
            </Grid>
            <Grid item>
              Long-form reviews count:
              {persona.fullReviews && Array.isArray(persona.fullReviews)
                ? persona.fullReviews.length
                : 0}
            </Grid>
            <Grid item>{persona.createdAt}</Grid>
          </Grid>
        </CardContent>
      </Grid>
    </Card>
  );
}

PersonaCard.propTypes = {
  persona: PropTypes.shape({
    badges: PropTypes.array,
    communities: PropTypes.array,
    fullReviews: PropTypes.array,
    rapidReviews: PropTypes.array,
    requests: PropTypes.array,
    name: PropTypes.string,
    avatar: PropTypes.string,
    createdAt: PropTypes.date,
  }),
};
