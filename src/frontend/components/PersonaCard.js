// base imports
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

// Material-ui components
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

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

  return (
    <Card className={classes.card}>
      <Grid container>
        <CardHeader
          className={classes.header}
          title={persona.name}
          avatar={
            <Avatar
              src={persona.avatar}
              alt={persona.name}
              className={classes.avatar}
            />
          }
        />
        <CardContent className={classes.content}>
          <Grid container>
            {persona && persona.badges.length > 0 && (
              <Grid item>
                <dt>
                  <Typography>Badges</Typography>
                </dt>
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
          </Grid>
        </CardContent>
      </Grid>
    </Card>
  );
}

PersonaCard.propTypes = {
  persona: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
  }),
};
