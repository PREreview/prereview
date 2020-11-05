import React, { Fragment, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { MdPublic } from 'react-icons/md';
import { Helmet } from 'react-helmet-async';
import IncognitoIcon from '../svgs/incognito_icon.svg';
import HeaderBar from './header-bar';
import { GetUser } from '../hooks/api-hooks.tsx';
import RoleActivity from './role-activity';
import LabelStyle from './label-style';
import XLink from './xlink';
import NotFound from './not-found';
import { ORG } from '../constants';
import { unprefix } from '../utils/jsonld';

export default function Profile() {
  const { roleId: unprefixedRoleId } = useParams();
  const roleId = `role:${unprefixedRoleId}`;

  const user = GetUser(roleId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const userId = user && user.isRoleOf;
  let orcid;
  if (userId) {
    orcid = unprefix(userId);
  }

  if (user.error) {
    // #FIXME
    return <NotFound />;
  }

  return (
    <div className="profile">
      <HeaderBar closeGap />

      <Helmet>
        <title>
          {ORG} • Profile {(user && user.name) || unprefixedRoleId}
        </title>
      </Helmet>

      <section className="profile__content">
        <header className="profile__header">
          {user && user.avatar && user.avatar.contentUrl ? (
            <img
              src={user.avatar.contentUrl}
              alt="avatar"
              className="profile__avatar-img"
            />
          ) : null}

          <section className="profile__identity-info">
            <header className="profile__indentity-info-header">
              <h2 className="profile__username">
                {user && user.name ? user.name : unprefixedRoleId}
              </h2>
              {!!user && (
                <span className="profile__persona-status">
                  {user['@type'] === 'PublicReviewerRole' ? (
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
                  to={`/about/${unprefixedRoleId}`}
                  href={`/about/${unprefixedRoleId}`}
                >
                  {unprefixedRoleId}
                </XLink>
              </dd>
              {!!user && (
                <Fragment>
                  <dt>
                    <LabelStyle>Identity</LabelStyle>
                  </dt>
                  <dd>
                    {user['@type'] === 'AnonymousReviewerRole'
                      ? 'Anonymous'
                      : 'Public'}
                  </dd>
                </Fragment>
              )}

              {!!orcid && (
                <Fragment>
                  <dt>
                    <LabelStyle>ORCID</LabelStyle>
                  </dt>
                  <dd>
                    <a href={`https://orcid.org/${orcid}`}>{orcid}</a>
                  </dd>
                </Fragment>
              )}

              {!!user && (
                <Fragment>
                  <dt>
                    <LabelStyle>Member since</LabelStyle>
                  </dt>
                  <dd>{format(new Date(user.startDate), 'MMM. d, yyyy')}</dd>
                </Fragment>
              )}
            </dl>
          </section>
        </header>
        <section className="profile__activity-section">
          <h2 className="profile__section-title">Activity</h2>

          <RoleActivity roleId={roleId} />
        </section>
      </section>
    </div>
  );
}
