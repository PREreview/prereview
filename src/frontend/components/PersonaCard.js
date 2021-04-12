// base imports
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { format } from 'date-fns';

// Material UI components
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  avatar: {
    height: 125,
    width: 125,
  },
  button: {
    color: '#000 !important',
    fontSize: '1.2rem',
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  gridMain: {
    borderBottom: `1px solid ${theme.palette.secondary.light}`,
    cursor: 'pointer',
    padding: 20,
  },
  paper: {
    borderBottom: `2px solid ${theme.palette.secondary.light}`,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    width: '100%',
  },
}));

export default function PersonaCard({ persona }) {
  const classes = useStyles();
  const history = useHistory();

  const [elevation, setElevation] = useState(0);

  const handleHover = () => {
    setElevation(elevation => (elevation ? 0 : 3));
  };

  const handleCardClick = () => {
    history.push(`/about/${persona.uuid}`);
  };

  return (
    <Paper
      elevation={elevation}
      square
      className={classes.paper}
      onMouseEnter={handleHover}
      onMouseLeave={handleHover}
    >
      <Grid
        onClick={handleCardClick}
        container
        direction="row"
        justify="space-between"
        className={classes.gridMain}
        alignItems="center"
      >
        <Grid item>
          <Typography component="div" variant="h6" gutterBottom>
            {persona.name}
          </Typography>
          <Typography component="div" variant="body1" gutterBottom>
            <b>Badges: </b>
            {persona.badges && persona.badges.length > 0
              ? persona.badges.map(badge => (
                  <Chip
                    key={badge.uuid}
                    label={badge.name}
                    color="primary"
                    size="small"
                  />
                ))
              : 'No badges yet.'}
          </Typography>
          <Typography component="div" variant="body1" gutterBottom>
            <b>Communities: </b>
            {persona.communities && persona.communities.length > 0
              ? persona.communities.map(community => (
                  <Chip
                    key={community.uuid}
                    label={community.name}
                    variant="outlined"
                    href={`/communities/${community.slug}`}
                    component="a"
                    target="_blank"
                    clickable
                  />
                ))
              : 'No communities yet.'}
          </Typography>
          <Typography component="div" variant="body1" gutterBottom>
            PREreview member since{' '}
            {format(new Date(persona.createdAt), 'yyyy/MM/dd')}
          </Typography>
        </Grid>
        <Grid item>
          <Avatar
            src={persona.avatar}
            alt={persona.name}
            className={classes.avatar}
          >
            {persona.name.charAt(0)}
          </Avatar>
        </Grid>
      </Grid>
    </Paper>
  );
}

PersonaCard.propTypes = {
  persona: PropTypes.shape({
    avatar: PropTypes.string,
    createdAt: PropTypes.date,
    name: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
    badges: PropTypes.arrayOf(PropTypes.object),
    communities: PropTypes.arrayOf(PropTypes.object),
  }),
};
