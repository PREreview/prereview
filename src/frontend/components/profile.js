// base imports
import React, { Fragment, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import { useGetPersona } from '../hooks/api-hooks.tsx';

// Material UI components
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';

// components
//import Avatar from './avatar';
import HeaderBar from './header-bar';
import LabelStyle from './label-style';
import Loading from './loading.js';
import NotFound from './not-found';
import RoleActivity from './role-activity';
import XLink from './xlink';
//import RoleEditor from './role-editor';

// icons
import { MdPublic } from 'react-icons/md';
import IncognitoIcon from '../svgs/incognito_icon.svg';

// constants
import { ORG } from '../constants';

export default function Profile() {
  const location = useLocation();
  const [thisUser] = useContext(UserProvider.context);
  //const [editAvatar, setEditAvatar] = useState(false);

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
            {thisUser.personas &&
            thisUser.personas.some(p => p.uuid === persona.uuid) ? (
              <IconButton href="/settings">
                <Avatar src={persona.avatar} className="profile__avatar-img" />
              </IconButton>
            ) : (
              <Avatar src={persona.avatar} className="profile__avatar-img" />
            )}

            {/*
            <Modal
              className="settings-role-editor-modal"
              title="Edit Persona Settings"
              open={editAvatar}
              onClose={() => {
                setEditAvatar(false);
              }}
            >
              <RoleEditor
                persona={persona}
                onCancel={() => {
                  setEditAvatar(false);
                }}
                onSaved={() => {
                  setEditAvatar(false);
                }}
              />
            </Modal>
            */}

            <section className="profile__identity-info">
              <header className="profile__indentity-info-header">
                <h2 className="profile__username">
                  {persona && persona.name ? persona.name : 'Name goes here'}
                </h2>
                {thisUser.personas &&
                thisUser.personas.some(p => p.uuid === persona.uuid) ? (
                  <XLink to={`/settings`} href={`/settings`}>
                    Edit user settings
                  </XLink>
                ) : null}
                {persona ? (
                  <span className="profile__persona-status">
                    {persona && !persona.isAnonymous ? (
                      <div className="profile__persona-status__icon-container">
                        <MdPublic className="profile__persona-status__icon" />{' '}
                        Public
                      </div>
                    ) : (
                      <div className="profile__persona-status__icon-container">
                        <img
                          src={IncognitoIcon}
                          className="profile__persona-status__icon"
                        />{' '}
                        Anonymous
                      </div>
                    )}
                  </span>
                ) : null}
              </header>

              <dl>
                <dt>
                  <LabelStyle>PREreview Name</LabelStyle>
                </dt>
                <dd>
                  <XLink
                    to={`/about/${persona.uuid}`}
                    href={`/about/${persona.uuid}`}
                  >
                    {persona.name}
                  </XLink>
                </dd>
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
                {persona && (
                  <Fragment>
                    <dt>
                      <LabelStyle>Identity</LabelStyle>
                    </dt>
                    <dd>
                      {persona && persona.isAnonymous ? 'Anonymous' : 'Public'}
                    </dd>
                  </Fragment>
                )}

                {/*
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
                  */}

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
