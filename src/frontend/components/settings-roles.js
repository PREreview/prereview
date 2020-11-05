import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { MdInfoOutline, MdPublic, MdStar, MdStarBorder } from 'react-icons/md';
import { getId, unprefix, arrayify } from '../utils/jsonld';
import Button from './button';
import Modal from './modal';
import RoleEditor from './role-editor';
import { RoleBadgeUI } from './role-badge';
import Controls from './controls';
import { UpdateUser, usePostAction, useUserRoles } from '../hooks/api-hooks.tsx';
import { useIsFirstTimeOnSettings } from '../hooks/ui-hooks';
import IncognitoIcon from '../svgs/incognito_icon.svg';
import XLink from './xlink';

export default function SettingsRoles({ user }) {
  const isFirstTimeOnSettings = useIsFirstTimeOnSettings();
  const [editedRoleId, setEditedRoleId] = useState(null);
  const [roles, fetchRolesProgress] = useUserRoles(user);

  if (!user) {
    if (user.error) {
      console.error(`Error: ${user.error}`);
    }
    return null;
  }

  const allHaveNames = roles.every(
    role => role.name && role.name !== unprefix(getId(role)),
  );
  const allHaveAvatars = roles.every(
    role => role.avatar && role.avatar.contentUrl,
  );

  return (
    <section className="settings-roles settings__section">
      {isFirstTimeOnSettings && (
        <div className="settings__welcome">
          <h3 className="settings__title settings__title--center">
            Welcome to Outbreak Science Rapid PREreview!
          </h3>
          <p className="settings__large-text">
            As a new member of our community, please take a moment to set up
            your public and anonymous persona profiles.
          </p>
        </div>
      )}

      <h3 className="settings__title">Personas</h3>

      <p>
        Personas allow you to manage your identity on Rapid PREreview. Personas
        can be public (linked to your{' '}
        <a href={`https://orcid.org/${user.orcid}`}>ORCID</a> profile) or kept
        anonymous.
      </p>

      <p>
        The <strong>active</strong> persona is the persona that will be used
        when you write <em>new</em> reviews or <em>new</em> request for feedback
        on preprints. It can be changed at any time.
      </p>

      {(!allHaveNames || !allHaveAvatars) && (
        <p className="settings-roles__notice">
          <MdInfoOutline className="settings-roles__notice-icon" />

          <span>
            It is recommended that you set{' '}
            {!allHaveNames && !allHaveAvatars
              ? 'a display name and an avatar'
              : !allHaveNames
              ? 'a display name'
              : 'an avatar'}{' '}
            for each of your personas. Click on the <strong>Edit</strong>{' '}
            buttons below to do so.
          </span>
        </p>
      )}

      {/* TODO fix markup: make a table with proper header so it's accessible */}
      <ul className="settings__persona-list">
        <li className="settings__persona-list-header">
          <div className="settings__persona-list-header__active">
            <span>Active</span>
          </div>
          <span className="settings__persona-list-header__username">
            Display name
          </span>
          <span className="settings__persona-list-header__anon">Anonymity</span>
          <span />
        </li>
        <li className="settings__persona-list-divider">
          <hr />
        </li>

        {arrayify(roles).map(role => (
          <li key={getId(role)} className="settings__persona-list-item">
            <div className="settings__persona-list-item__active-state">
              {getId(role) === user.defaultRole ? (
                <span className="settings__persona-list-item__is-active">
                  <MdStar className="settings__persona-active-icon" />
                  <span className="settings__persona-active-label">Active</span>
                </span>
              ) : (
                <MakeActivePersonaModalButton user={user} role={role} />
              )}
            </div>
            <div className="settings__persona-list-item__username">
              <RoleBadgeUI role={role} className="settings__persona-badge" />

              <XLink
                href={`/about/${unprefix(getId(role))}`}
                to={`/about/${unprefix(getId(role))}`}
                className="settings__persona-link"
              >
                {role.name || unprefix(getId(role))}
              </XLink>
            </div>
            <span className="settings__persona-status">
              {role['@type'] === 'PublicReviewerRole' ? (
                <div className="settings__persona-status__icon-container">
                  <MdPublic className="settings__persona-status__icon" />{' '}
                  <span className="settings__persona-status__label">
                    Public
                  </span>
                </div>
              ) : (
                <div className="settings__persona-status__icon-container">
                  <IncognitoIcon className="settings__persona-status__icon" />{' '}
                  <span className="settings__persona-status__label">
                    Anonymous
                  </span>
                </div>
              )}
            </span>
            <Button
              onClick={() => {
                setEditedRoleId(getId(role));
              }}
            >
              Edit
            </Button>
          </li>
        ))}
      </ul>

      <Controls className="settings-roles__body-controls">
        <Button element="XLink" to="/" href="/" primary={true}>
          {isFirstTimeOnSettings ? 'Start Reviewing' : 'Done'}
        </Button>
      </Controls>

      {!!editedRoleId && (
        <Modal
          className="settings-role-editor-modal"
          title="Edit Persona Settings"
          onClose={() => {
            setEditedRoleId(null);
          }}
        >
          <RoleEditor
            key={editedRoleId}
            user={user}
            role={roles.find(role => getId(role) === editedRoleId)}
            onCancel={() => {
              setEditedRoleId(null);
            }}
            onSaved={action => {
              setEditedRoleId(null);
            }}
          />
        </Modal>
      )}
    </section>
  );
}

SettingsRoles.propTypes = {
  user: PropTypes.shape({
    orcid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    hasRole: PropTypes.arrayOf(PropTypes.string),
    error: PropTypes.string,
  }).isRequired,
};

function MakeActivePersonaModalButton({ user, role }) {
  const [isOpen, setIsOpen] = useState(false);
  const [post, postProgress] = usePostAction();

  return (
    <Fragment>
      <Button
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <MdStarBorder className="settings__persona-active-icon settings__persona-active-icon--inactive" />
        <span className="settings__persona-active-label">Activate…</span>
      </Button>

      {isOpen && (
        <Modal
          title={`Set active persona to ${role.name || unprefix(getId(role))}`}
        >
          <p>
            The <strong>active</strong> persona is the persona that will be used
            when you write <em>new</em> reviews or <em>new</em> request for
            feedback on preprints. It can be changed at any time.
          </p>

          <Controls error={postProgress.error}>
            <Button
              disabled={postProgress.isActive}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              isWaiting={postProgress.isActive}
              disabled={postProgress.isActive}
              onClick={() => {
                post(
                  {
                    '@type': 'UpdateUserAction',
                    agent: getId(user),
                    object: getId(user),
                    actionStatus: 'CompletedActionStatus',
                    payload: {
                      defaultRole: getId(role),
                    },
                  },
                  body => {
                    setIsOpen(false);
                  },
                );
              }}
            >
              Make active
            </Button>
          </Controls>
        </Modal>
      )}
    </Fragment>
  );
}
MakeActivePersonaModalButton.propTypes = {
  user: PropTypes.object.isRequired,
  role: PropTypes.object.isRequired,
};
