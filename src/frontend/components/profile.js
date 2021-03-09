// base imports
import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useParams } from 'react-router-dom';
import { format } from 'date-fns';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import { useGetPersona } from '../hooks/api-hooks.tsx';

// Material UI components
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import Modal from '@material-ui/core/Modal';
import Switch from '@material-ui/core/Switch';

// components
import HeaderBar from './header-bar';
import LabelStyle from './label-style';
import Loading from './loading.js';
import NotFound from './not-found';
import RoleActivity from './role-activity';
import XLink from './xlink';
//import RoleEditor from './role-editor';

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
  const location = useLocation();
  const [thisUser] = useContext(UserProvider.context);
  //const [editAvatar, setEditAvatar] = useState(false);
  const { id } = useParams();

  // returns true if the profile page belongs to the logged in user 
  const ownProfile = thisUser.personas.some(persona => persona.uuid === id); 

  const [activePersona, setActivePersona] = useState(thisUser ? thisUser.defaultPersona : {})
  console.log("activePersona", activePersona, activePersona.uuid)
  console.log("params id", id)

  const { data: persona, loading, error } = useGetPersona({
    id: location.pathname.slice(7),
    resolve: persona => persona.data[0],
  });

  if (loading || !persona) {
    return <Loading />;
  } else if (error) {
    return <NotFound />;
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
            {thisUser && thisUser.uuid === persona.identity.uuid ? (
              <IconButton href="/settings">
                <Avatar src={persona.avatar} className="profile__avatar-img" />
              </IconButton>
            ) : (
              <Avatar src={persona.avatar} className="profile__avatar-img" />
            )}

            <section className="profile__identity-info">
              <header className="profile__indentity-info-header">
                { ownProfile ? <PersonaSwitch /> : null }
                { ownProfile ? (
                  <XLink to={`/settings`} href={`/settings`}>
                    Edit user settings
                  </XLink>
                ) : null}
              </header>

              <dl>
                {persona && persona.badges.length > 0 && (
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

            <RoleActivity persona={persona} />
          </section>
        </section>
      </div>
    );
  }
}
