// base imports
import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { unprefix } from '../utils/jsonld';

// Material UI
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

// hooks
import { useIsFirstTimeOnSettings } from '../hooks/ui-hooks';
import { usePutUser } from '../hooks/api-hooks.tsx';

// components
import Button from './button';
import Controls from './controls';
import Modal from './modal';
import RoleEditor from './role-editor';
import { RoleBadgeUI } from './role-badge';
import XLink from './xlink';

// icons
import { MdInfoOutline, MdPublic, MdStar, MdStarBorder } from 'react-icons/md';
import incognitoIcon from '../svgs/incognito_icon.svg';

const useStyles = makeStyles({
  relative: {
    position: 'relative',
  },
  table: {
    maxHeight: 650,
  },
});

export default function SettingsRoles({ user }) {
  const classes = useStyles();
  const isFirstTimeOnSettings = useIsFirstTimeOnSettings();
  const [userToEdit, setUserToEdit] = useState(null);

  return (
    <section className="settings-roles settings__section">
      {isFirstTimeOnSettings && (
        <div className="settings__welcome">
          <h3 className="settings__title settings__title--center">
            Welcome to PREreview!
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
      <TableContainer>
        <Table
          stickyHeader
          className={classes.table}
          aria-label="personas table"
        >
          <TableHead>
            <TableRow>
              <TableCell className="settings__persona-list-header">
                Active
              </TableCell>
              <TableCell className="settings__persona-list-header">
                Display Name
              </TableCell>
              <TableCell className="settings__persona-list-header">
                Anonymity
              </TableCell>
              <TableCell>
                <div className="vh">Controls</div>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {user.personas.map(persona => {
              console.log(persona);
              return (
                <TableRow key={persona.id}>
                  <TableCell>
                    <div className="settings__persona-list-item__active-state">
                      {persona.isActive ? (
                        <span className="settings__persona-list-item__is-active">
                          <MdStar className="settings__persona-active-icon" />
                          <span className="settings__persona-active-label">
                            Active
                          </span>
                        </span>
                      ) : (
                        <MakeActivePersonaModalButton
                          user={user}
                          persona={persona}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="settings__persona-list-item__username">
                      <RoleBadgeUI
                        user={persona}
                        className="settings__persona-badge"
                      />

                      <XLink
                        href={`/about/${unprefix(persona.id)}`}
                        to={`/about/${unprefix(user.id)}`}
                        className="settings__persona-link"
                      >
                        {persona.name || unprefix(persona.id)}
                      </XLink>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="settings__persona-status">
                      {persona.isActive ? (
                        <div className="settings__persona-status__icon-container">
                          <MdPublic className="settings__persona-status__icon" />{' '}
                          <span className="settings__persona-status__label">
                            Public
                          </span>
                        </div>
                      ) : (
                        <div className="settings__persona-status__icon-container">
                          <img
                            src={incognitoIcon}
                            className="settings__persona-status__icon"
                          />{' '}
                          <span className="settings__persona-status__label">
                            Anonymous
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {!persona.isAnonymous ? (
                      <Button
                        onClick={() => {
                          setUserToEdit(persona);
                        }}
                      >
                        Edit
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Controls className="settings-roles__body-controls">
        <Button element="XLink" to="/" href="/" primary={true}>
          {isFirstTimeOnSettings ? 'Start Reviewing' : 'Done'}
        </Button>
      </Controls>

      {!!userToEdit && (
        <Modal
          className="settings-role-editor-modal"
          title="Edit Persona Settings"
          onClose={() => {
            setUserToEdit(null);
          }}
        >
          <RoleEditor
            user={userToEdit}
            onCancel={() => {
              setUserToEdit(null);
            }}
            onSaved={() => {
              setUserToEdit(null);
            }}
          />
        </Modal>
      )}
    </section>
  );
}

SettingsRoles.propTypes = {
  user: PropTypes.object.isRequired,
};

function MakeActivePersonaModalButton({ user, persona }) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: updateUser, loading, error } = usePutUser({
    id: user.id});

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
        <Modal title={`Set active persona to ${user.name || user.id}`}>
          <p>
            The <strong>public</strong> persona makes your information viewable
            by other users when you write <em>new</em> reviews or <em>new</em>{' '}
            request for feedback on preprints. Once your profile is public, it
            cannot be changed.
          </p>

          <Controls error={error}>
            <Button
              disabled={loading}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              isWaiting={loading}
              disabled={loading}
              onClick={() => {
                updateUser({ defaultPersona: persona.id })
                  .then(() => alert('User updated successfully.'))
                  .catch(err => alert(`An error occurred: ${err.message}`));
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
  persona: PropTypes.object.isRequired,
};
