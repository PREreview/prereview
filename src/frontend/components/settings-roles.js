import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { MdInfoOutline, MdPublic, MdStar, MdStarBorder } from 'react-icons/md';
import { unprefix } from '../utils/jsonld';
import Button from './button';
import Modal from './modal';
import RoleEditor from './role-editor';
import { RoleBadgeUI } from './role-badge';
import Controls from './controls';
import { PutUser } from '../hooks/api-hooks.tsx';
import { useIsFirstTimeOnSettings } from '../hooks/ui-hooks';
import IncognitoIcon from '../svgs/incognito_icon.svg';
import XLink from './xlink';

export default function SettingsRoles({ user }) {
  const isFirstTimeOnSettings = useIsFirstTimeOnSettings();
  const [editedRoleId, setEditedRoleId] = useState(null);

  if (!user) {
    if (user.error) {
      console.error(`Error: ${user.error}`);
    }
    return null;
  }

  return (
    <section className="settings-roles settings__section">
      {isFirstTimeOnSettings && (
        <div className="settings__welcome">
          <h3 className="settings__title settings__title--center">
            Welcome to Outbreak Science Rapid PREreview!
          </h3>
          <p className="settings__large-text">
            As a new member of our community, please take a moment to set up
            your persona profile.
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
        The <strong>public</strong> persona is the persona that will be used
        when you write <em>new</em> reviews or <em>new</em> request for feedback
        on preprints. It can be changed at any time.
      </p>

      {(!user.name || !user.avatar) && (
        <p className="settings-roles__notice">
          <MdInfoOutline className="settings-roles__notice-icon" />

          <span>
            It is recommended that you set{' '}
            {!user.name && !user.avatar
              ? 'a display name and an avatar'
              : !user.name
              ? 'a display name'
              : 'an avatar'}{' '}
            for your persona. Click on the <strong>Edit</strong> buttons below
            to do so.
          </span>
        </p>
      )}

      {/* FIXME fix markup: make a table with proper header so it's accessible */}
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

        <li key={user.id} className="settings__persona-list-item">
          <div className="settings__persona-list-item__active-state">
            {!user.public ? (
              <span className="settings__persona-list-item__is-active">
                <MdStar className="settings__persona-active-icon" />
                <span className="settings__persona-active-label">Active</span>
              </span>
            ) : (
              <MakeActivePersonaModalButton user={user} />
            )}
          </div>
          <div className="settings__persona-list-item__username">
            <RoleBadgeUI user={user} className="settings__persona-badge" />

            <XLink
              href={`/about/${unprefix(user.id)}`}
              to={`/about/${unprefix(user.id)}`}
              className="settings__persona-link"
            >
              {user.name || unprefix(user.id)}
            </XLink>
          </div>
          <span className="settings__persona-status">
            {user.public ? (
              <div className="settings__persona-status__icon-container">
                <MdPublic className="settings__persona-status__icon" />{' '}
                <span className="settings__persona-status__label">Public</span>
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
              setEditedRoleId(user.id);
            }}
          >
            Edit
          </Button>
        </li>
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
            onCancel={() => {
              setEditedRoleId(null);
            }}
            onSaved={() => {
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
    id: PropTypes.string.isRequired,
    orcid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    public: PropTypes.bool.isRequired,
    hasRole: PropTypes.arrayOf(PropTypes.string),
    error: PropTypes.string,
  }).isRequired,
};

function MakeActivePersonaModalButton({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const updateUser = PutUser();

  return (
    <Fragment>
      <Button
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <MdStarBorder className="settings__persona-active-icon settings__persona-active-icon--inactive" />
        <span className="settings__persona-active-label">Make public</span>
      </Button>

      {isOpen && (
        <Modal
          title={`Set active persona to ${user.name || unprefix(user.id)}`}
        >
          <p>
            The <strong>public</strong> persona makes your information viewable
            by other users when you write <em>new</em> reviews or <em>new</em>{' '}
            request for feedback on preprints. Once your profile is public, it
            cannot be changed.
          </p>

          <Controls
            error={updateUser.error} // #FIXME
          >
            <Button
              disabled={updateUser.loading}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              isWaiting={updateUser.loading}
              disabled={updateUser.loading}
              onClick={() => {
                updateUser(user)
                  .then(() => alert('User updated successfully.'))
                  .catch(err => alert(`An error occurred: ${err}`));
                setIsOpen(false);
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
