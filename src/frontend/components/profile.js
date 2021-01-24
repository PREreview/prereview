import React, { Fragment, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { UserContext } from '../contexts/user-context';
import { MdPublic } from 'react-icons/md';
import { Helmet } from 'react-helmet-async';
import IncognitoIcon from '../svgs/incognito_icon.svg';
import Loading from './loading.js'
import HeaderBar from './header-bar';
import { useGetPersona } from '../hooks/api-hooks.tsx';
import RoleActivity from './role-activity';
import LabelStyle from './label-style';
import XLink from './xlink';
import NotFound from './not-found';
import { ORG } from '../constants';

export default function Profile() {
  const location = useLocation();
  const thisUser = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [persona, setPersona] = useState(null);
  // const [imageUrl, setImageUrl] = useState('') FIXME 

  const { data: personaData, loading: loadingPersona, error } = useGetPersona({
    id: location.pathname.slice(7),
  });
  
  useEffect(() => {
    if (!loadingPersona) {
      if (personaData) {
          setPersona(personaData.data[0]);
          setLoading(false);
        }
    }
  }, [loadingPersona, personaData]);

  if (loading || !personaData) {
    return <Loading />;
  } else if (error) {
    return <NotFound />;
  } else {
    return (
      <div className="profile">
        <HeaderBar thisUser={thisUser} closeGap />

        <Helmet>
          <title>
            {ORG} • Profile {persona.name}
          </title>
        </Helmet>

        <section className="profile__content">
          <header className="profile__header">
            {persona && persona.avatar ? (
              <img
                src={''}
                alt="avatar"
                className="profile__avatar-img"
              />
            ) : null}

            <section className="profile__identity-info">
              <header className="profile__indentity-info-header">
                <h2 className="profile__username">
                  {persona && persona.name ? persona.name : "Name goes here"}
                </h2>
                { persona ? (
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
                    to={`/about/${persona.id}`}
                    href={`/about/${persona.id}`}
                  >
                    {persona.name}
                  </XLink>
                </dd>
                {persona && (
                  <Fragment>
                    <dt>
                      <LabelStyle>Identity</LabelStyle>
                    </dt>
                    <dd>
                      {persona && persona.isAnonymous
                        ? 'Anonymous'
                        : 'Public'}
                    </dd>
                  </Fragment>
                )}

                { !persona.isAnonymous && (
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

                { persona && (
                  <Fragment>
                    <dt>
                      <LabelStyle>Member since</LabelStyle>
                    </dt>
                    <dd>{format(new Date(persona.createdAt), 'MMM. d, yyyy')}</dd> 
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
