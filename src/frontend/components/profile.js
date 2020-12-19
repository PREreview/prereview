import React, { Fragment, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { MdPublic } from 'react-icons/md';
import { Helmet } from 'react-helmet-async';
import IncognitoIcon from '../svgs/incognito_icon.svg';
import HeaderBar from './header-bar';
import { useGetUser } from '../hooks/api-hooks.tsx';
import RoleActivity from './role-activity';
import LabelStyle from './label-style';
import XLink from './xlink';
import NotFound from './not-found';
import { ORG } from '../constants';

export default function Profile() {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [persona, setPersona] = useState(null);

  const { roleId: unprefixedRoleId } = useParams();
  const roleId = `role:${unprefixedRoleId}`;

  const { data: userData, loading: loadingUser, error } = useGetUser({
    id: location.pathname.slice(7),
  });

  useEffect(() => {
    // window.scrollTo(0, 0);
    if (!loadingUser) {
      if (userData) {
        console.log(userData.data);
        userData.data.personas.filter(persona => {
          persona.isActive ? setPersona(persona) : null;
        });
        setLoading(false);
        setUser(userData.data);
      }
    }
  }, [loadingUser, userData]);

  if (error) {
    // #FIXME
    return <NotFound />;
  } else if (loading) {
    return <div>Loading...</div>;
  } else {
    return (
      <div className="profile">
        <HeaderBar closeGap />

        <Helmet>
          <title>
            {ORG} • Profile {persona.name}
          </title>
        </Helmet>

        <section className="profile__content">
          <header className="profile__header">
            {persona && persona.avatar && persona.avatar.contentUrl ? (
              <img
                src={user.avatar.contentUrl}
                alt="avatar"
                className="profile__avatar-img"
              />
            ) : null}

            <section className="profile__identity-info">
              <header className="profile__indentity-info-header">
                <h2 className="profile__username">
                  {persona && persona.name ? persona.name : user.name}
                </h2>
                {user && (
                  <span className="profile__persona-status">
                    {persona && persona.name != 'Anonymous' ? (
                      <div className="profile__persona-status__icon-container">
                        <MdPublic className="profile__persona-status__icon" />{' '}
                        Public
                      </div>
                    ) : (
                      <div className="profile__persona-status__icon-container">
                        <IncognitoIcon className="profile__persona-status__icon" />{' '}
                        Anonymous
                      </div>
                    )}
                  </span>
                )}
              </header>

              <dl>
                <dt>
                  <LabelStyle>Rapid PREreview identifier</LabelStyle>
                </dt>
                <dd>
                  <XLink
                    to={`/about/${user.orcid ? user.orcid : user.id}`}
                    href={`/about/${user.orcid ? user.orcid : user.id}`}
                  >
                    {user.name}
                  </XLink>
                </dd>
                {user && (
                  <Fragment>
                    <dt>
                      <LabelStyle>Identity</LabelStyle>
                    </dt>
                    <dd>
                      {persona && persona.name == 'Anonymous'
                        ? 'Anonymous'
                        : 'Public'}
                    </dd>
                  </Fragment>
                )}

                {user.orcid && (
                  <Fragment>
                    <dt>
                      <LabelStyle>ORCID</LabelStyle>
                    </dt>
                    <dd>
                      <a href={`https://orcid.org/${user.orcid}`}>
                        {user.orcid}
                      </a>
                    </dd>
                  </Fragment>
                )}

                {user && (
                  <Fragment>
                    <dt>
                      <LabelStyle>Member since</LabelStyle>
                    </dt>
                    <dd>{format(new Date(user.createdAt), 'MMM. d, yyyy')}</dd>
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
