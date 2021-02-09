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

export default function SettingsRoles({ user, updateUser }) {
  const classes = useStyles();
  const isFirstTimeOnSettings = useIsFirstTimeOnSettings();
  const [personaToEdit, setPersonaToEdit] = useState(null);
  const [activePersona, setActivePersona] = useState(
    user ? user.defaultPersona : null,
  );

  const handleActivePersonaClose = persona => {
    setActivePersona(persona);
    updateUser({...user, defaultPersona: persona})
  };

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
        The <strong>active</strong> persona is the persona that will be used
        when you write <em>new</em> reviews or <em>new</em> request for feedback
        on preprints. It can be changed at any time.
      </p>

      {(!activePersona.name || !activePersona.avatar) && (
        <p className="settings-roles__notice">
          <MdInfoOutline className="settings-roles__notice-icon" />

          <span>
            It is recommended that you set{' '}
            {!activePersona.name && !activePersona.avatar
              ? 'a display name and an avatar'
              : !activePersona.name
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
              return (
                <TableRow key={persona.uuid}>
                  <TableCell>
                    <div className="settings__persona-list-item__active-state">
                      {activePersona.uuid === persona.uuid ? (
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
                          handleClose={handleActivePersonaClose}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="settings__persona-list-item__username">
                      <RoleBadgeUI
                        disabled={true}
                        user={persona}
                        className="settings__persona-badge"
                      />

                      <XLink
                        href={`/about/${persona.uuid}`}
                        to={`/about/${persona.uuid}`}
                        className="settings__persona-link"
                      >
                        {persona.name || unprefix(persona.uuid)}
                      </XLink>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="settings__persona-status">
                      {!persona.isAnonymous ? (
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
                          setPersonaToEdit(persona);
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

      {/* FIXME: Not sure we need this anymore?*/}

      {/*<Controls className="settings-roles__body-controls">
        <Button element="XLink" to="/" href="/" primary={true}>
          {isFirstTimeOnSettings ? 'Start Reviewing' : 'Done'}
        </Button>
      </Controls>*/}

      {!!personaToEdit && (
        <Modal
          className="settings-role-editor-modal"
          title="Edit Persona Settings"
          onClose={() => {
            setPersonaToEdit(null);
          }}
        >
          <RoleEditor
            persona={personaToEdit}
            onCancel={() => {
              setPersonaToEdit(null);
            }}
            onSaved={() => {
              setPersonaToEdit(null);
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

function MakeActivePersonaModalButton({ user, persona, handleClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: updateUser, loading } = usePutUser({
    id: user.uuid,
  });

  return (
    <Fragment>
      <Button
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <MdStarBorder className="settings__persona-active-icon settings__persona-active-icon--inactive" />
        <span className="settings__persona-active-label">Make active</span>
      </Button>

      {isOpen && (
        <Modal title={`Set active persona to ${persona.name}`}>
          <p>
            The <strong>active</strong> persona makes your information viewable
            by other users when you write <em>new</em> reviews or <em>new</em>{' '}
            request for feedback on preprints. Once your profile is public, it
            cannot be changed.
          </p>

          <Controls>
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
                  .then(() => {
                    alert('User updated successfully.');
                    setIsOpen(false);
                    return handleClose(persona);
                  })
                  .catch(err => alert(`An error occurred: ${err.message}`));
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
  handleClose: PropTypes.func,
};
