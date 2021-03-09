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
import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
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

export default function Profile() {
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
          <header className="profile__header">
            {ownProfile ? (
              <IconButton href="/settings">
                <Avatar src={persona.avatar} className="profile__avatar-img" />
              </IconButton>
            ) : (
              <Avatar src={persona.avatar} className="profile__avatar-img" />
            )}

            <section className="profile__identity-info">
              <header className="profile__indentity-info-header">
                {ownProfile ? (
                  <Typography component="div">
                    <Grid
                      component="label"
                      container
                      alignItems="center"
                      spacing={1}
                    >
                      <Grid item>Public</Grid>
                      <Grid item>
                        <PersonaSwitch checked={checked} onChange={handleSwitch} />
                      </Grid>
                      <Grid item>Anonymous</Grid>
                    </Grid>
                  </Typography>
                ) : null}
                {ownProfile ? (
                  <XLink to={`/settings`} href={`/settings`}>
                    Edit user settings
                  </XLink>
                ) : null}
              </header>

              <dl>
                {persona.badges && persona.badges.length > 0 && (
                  <Fragment>
                    <dt>
                      <LabelStyle>Badges</LabelStyle>
                    </dt>
                    <dd className="profile__chips">
                      {persona.badges.map(badge => (
                        <Chip
                          key={badge.uuid}
                          label={badge.name}
                          color="primary"
                          size="small"
                          className="profile__chip"
                        />
                      ))}
                    </dd>
                  </Fragment>
                )}

                {!persona.isAnonymous && (
                  <Fragment>
                    <dt>
                      <LabelStyle>ORCID</LabelStyle>
                    </dt>
                    <dd>
                      <a href={`https://orcid.org/${persona.identity.orcid}`}>
                        {persona.identity.orcid}
                      </a>
                    </dd>
                  </Fragment>
                )}

                {persona && (
                  <Fragment>
                    <dt>
                      <LabelStyle>Member since</LabelStyle>
                    </dt>
                    <dd>
                      {format(new Date(persona.createdAt), 'MMM. d, yyyy')}
                    </dd>
                  </Fragment>
                )}
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
