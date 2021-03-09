// base imports
import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useHistory, useParams } from 'react-router-dom';
import { format } from 'date-fns';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import { useGetPersona } from '../hooks/api-hooks.tsx';

// Material UI components
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Modal from '@material-ui/core/Modal';
import Switch from '@material-ui/core/Switch';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

// components
import HeaderBar from './header-bar';
import LabelStyle from './label-style';
import Loading from './loading.js';
//import NotFound from './not-found';
import RoleActivity from './role-activity';
//import RoleEditor from './role-editor';
import XLink from './xlink';

// constants
import { ORG } from '../constants';

const PersonaSwitch = withStyles(theme => ({
  root: {
    width: 70,
    height: 30,
    padding: 2,
    margin: theme.spacing(1),
  },
  switchBase: {
    padding: 1,
    '&$checked': {
      transform: 'translateX(44px)',
      color: theme.palette.common.white,
      '& + $track': {
        backgroundColor: '#52d869',
        opacity: 1,
        border: 'none',
      },
    },
    '&$focusVisible $thumb': {
      color: '#52d869',
      border: '6px solid #fff',
    },
  },
  thumb: {
    width: 27,
    height: 27,
  },
  track: {
    borderRadius: 30 / 2,
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: theme.palette.grey[50],
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border']),
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

const useStyles = makeStyles(theme => ({
  avatar: {
    height: 220,
    width: 220,
  },
}));

export default function Profile() {
  const classes = useStyles();
  const [thisUser, setUser] = useContext(UserProvider.context);
  // const [editAvatar, setEditAvatar] = useState(false);
  const { id } = useParams();
  const history = useHistory();
  const ownProfile = !thisUser ? false : thisUser.personas.some(persona => persona.uuid === id); // returns true if the profile page belongs to the logged in user
  const anonPersona = !thisUser ? null : thisUser.personas.filter(persona => persona.isAnonymous)[0]
  const publicPersona = !thisUser ? null : thisUser.personas.filter(persona => !persona.isAnonymous)[0]
  const [persona, setPersona] = useState(thisUser ? thisUser.defaultPersona : {})

  const { data: personaData, loading, error } = useGetPersona({
    id: id,
    resolve: personaData => personaData.data[0],
  });

  const [checked, setChecked] = useState(persona && persona.isAnonymous ? true : false)

  const handleSwitch = () => {
    setChecked(!checked)
    setPersona(checked ? anonPersona : publicPersona);
    setUser({...thisUser, defaultPersona: checked ? anonPersona : publicPersona})
  }

  useEffect(() => {
    console.log("useEffect is happening", persona)
    history.push(`/about/${persona.uuid}`);
   if (!loading) {
     setPersona(personaData)
   }
  }, [persona, checked])

  if (!persona || loading || !personaData) {
    return <Loading />;
  } else {
    return (
      <div className="profile">
        <HeaderBar thisUser={thisUser} closeGap />

        <Helmet>
          <title>
            {persona.name} • {ORG}
          </title>
        </Helmet>

        <section className="profile__content">
          {ownProfile ? (
            <Box textAlign="center">
              <Container>
                <Grid
                  component="label"
                  container
                  alignItems="center"
                  justify="space-between"
                  spacing={8}
                >
                  <Grid
                    container
                    item
                    xs={12}
                    md={6}
                    alignItems="center"
                    justify="flex-start"
                  >
                    <Grid item xs={4}>
                      <Typography component="div" variant="body1">
                        Public
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <PersonaSwitch
                        checked={checked}
                        onChange={handleSwitch}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography component="div" variant="body1">
                        Anonymous
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <XLink to={`/settings`} href={`/settings`}>
                      Edit user settings
                    </XLink>
                  </Grid>
                </Grid>
              </Container>
            </Box>
          ) : null}

          <Box my={8}>
            <Container>
              <Grid container justify="space-between" alignItems="flex-start">
                <Grid item>
                  {!persona.isAnonymous && (
                    <Box>
                      <Typography component="div" variant="h6" gutterBottom>
                        {persona.name}
                      </Typography>
                      <Typography component="div" variant="body1" gutterBottom>
                        <Link
                          href={`https://orcid.org/${persona.identity.orcid}`}
                        >
                          ORCHID {persona.identity.orcid}
                        </Link>
                      </Typography>
                      <Typography component="div" variant="body1" gutterBottom>
                        <b>Email address: </b>
                        {persona.email ? persona.email : `None provided`}
                      </Typography>
                      <Typography component="div" variant="body1" gutterBottom>
                        <b>Badges: </b>
                        {persona.badges &&
                          persona.badges.length > 0 &&
                          persona.badges.map(badge => (
                            <Chip
                              key={badge.uuid}
                              label={badge.name}
                              color="primary"
                              size="small"
                            />
                          ))}
                      </Typography>
                      <Typography component="div" variant="body1" gutterBottom>
                        <b>Area(s) of expertise: </b>
                      </Typography>
                      <Typography component="div" variant="body1" gutterBottom>
                        Community member since{' '}
                        {format(new Date(persona.createdAt), 'MMM. d, yyyy')}
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item>
                  {ownProfile ? (
                    <IconButton href="/settings">
                      <Avatar src={persona.avatar} className={classes.avatar} />
                    </IconButton>
                  ) : (
                    <Avatar src={persona.avatar} className={classes.avatar} />
                  )}
                  {persona.badges && persona.badges.length > 0 && (
                    <Box>
                      <Typography component="div" variant="button">
                        Badges
                      </Typography>
                      {persona.badges.map(badge => (
                        <Chip
                          key={badge.uuid}
                          label={badge.name}
                          color="primary"
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                </Grid>
              </Grid>
              <Typography component="div" variant="body1" gutterBottom>
                <b>About</b>
                <br />
                {persona.bio}
              </Typography>
            </Container>
          </Box>

          <header className="profile__header">


            <section className="profile__identity-info">
              <dl>
              </dl>
            </section>
          </header>
          <section className="profile__activity-section">
            <h2 className="profile__section-title">Activity</h2>

            <RoleActivity persona={personaData} />
          </section>
        </section>
      </div>
    );
  }
}
