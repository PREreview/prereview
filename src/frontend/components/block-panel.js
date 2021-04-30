// base imports
import React, { Fragment, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

// hooks
import { useGetPersonas, usePutPersona } from '../hooks/api-hooks.tsx';

// contexts
import UserProvider from '../contexts/user-context';

// components
import Button from './button';
import Controls from './controls';
import HeaderBar from './header-bar';
import IconButton from './icon-button';
import LabelStyle from './label-style';
import Modal from './modal';
import { RoleBadgeUI } from './role-badge';
import TextInput from './text-input';

// icons
import { MdClose } from 'react-icons/md';

// constants
import { ORG } from '../constants';

export default function BlockPanel() {
  const [user] = useContext(UserProvider.context);
  const [lockedPersonas, setLockedPersonas] = useState([]);
  const [personaToUnlock, setPersonaToUnlock] = useState(null);

  const { data: personas, loadingPersonas, error: personaError } = useGetPersonas();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!loadingPersonas) {
      if (personas && personas.data) {
        setLockedPersonas(personas.data.filter(persona => persona.isLocked));
      }
    }
  }, [loadingPersonas, personas, user]);

  return (
    <div className="block-panel">
      <Helmet>
        <title>Moderate Users • {ORG}</title>
      </Helmet>
      <HeaderBar thisUser={user} closeGap />

      <section>
        <header className="block-panel__header">
          <span>Locked Personas</span>
          <Button
            primary={true}
            onClick={() => {
              setIsAddModalOpen(true);
            }}
          >
            Lock persona
          </Button>
        </header>

        {lockedPersonas ? (
          !lockedPersonas.length ? (
            <div>No locked persona.</div>
          ) : (
            <div>
              <ul className="block-panel__card-list">
                {lockedPersonas.map(persona => (
                  <li
                    key={persona.uuid}
                    className="block-panel__card-list-item"
                  >
                    <div className="block-panel__card-list-item__left">
                      <RoleBadgeUI user={persona} />
                      <span>{persona.name}</span>
                    </div>
                    <div className="block-panel__card-list-item__right">
                      <LabelStyle>
                        {persona.isAnonymous ? 'Anonymous' : 'Public'}
                      </LabelStyle>
                      <IconButton
                        className="block-panel__remove-button"
                        onClick={() => {
                          setPersonaToUnlock(persona);
                        }}
                      >
                        <MdClose className="block-panel__remove-button-icon" />
                      </IconButton>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        ) : null}
      </section>

      {isAddModalOpen && (
        <BlockPanelAddModal
          user={user}
          onClose={() => {
            setIsAddModalOpen(false);
          }}
          onSuccess={locked => setLockedPersonas(lockedPersonas.concat(locked))}
        />
      )}

      {personaToUnlock ? (
        <BlockPanelRemoveModal
          user={user}
          persona={personaToUnlock}
          onClose={() => {
            setPersonaToUnlock(null);
          }}
          onSuccess={unlocked => {
            setLockedPersonas(
              lockedPersonas.filter(persona => persona.uuid !== unlocked.uuid),
            );
          }}
        />
      ) : null}
    </div>
  );
}

function BlockPanelAddModal({ onClose, onSuccess }) {
  const [personaToLock, setPersonaToLock] = useState('');
  const { mutate: updatePersona, loading, error } = usePutPersona({
    id: personaToLock,
  });
  const [frame] = useState('input');

  const pattern =
    '^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$'; // uuid v4
  // const re = new RegExp(pattern, 'i');

  return (
    <Modal title="Block persona">
      <div className="block-panel-add-modal">
        {frame === 'input' ? (
          <Fragment>
            <TextInput
              inputId="step-preprint-input-new"
              label={<span>Enter a persona name</span>}
              minimal={true}
              autoComplete="off"
              disabled={loading}
              placeholder=""
              pattern={pattern}
              onChange={e => {
                const value = e.target.value;
                setPersonaToLock(value);
              }}
              value={personaToLock}
            />

            <Controls
              error={error} // #FIXME
            >
              <Button
                disabled={loading}
                onClick={() => {
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={loading}
                isWaiting={loading}
                onClick={() => {
                  updatePersona({ isLocked: true })
                    .then(resp => {
                      let locked = resp.data;
                      alert(`Persona successfully locked`);
                      onSuccess(locked);
                      return onClose();
                    })
                    .catch(err => alert(`An error occurred: ${err.message}`));
                }}
              >
                Lock
              </Button>
            </Controls>
          </Fragment>
        ) : (
          <Fragment>
            <p>The persona has been successfully locked.</p>

            <Controls
              error={error} // #FIXME
            >
              <Button
                disabled={loading}
                onClick={() => {
                  onClose();
                }}
              >
                Close
              </Button>
            </Controls>
          </Fragment>
        )}
      </div>
    </Modal>
  );
}

BlockPanelAddModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

function BlockPanelRemoveModal({ persona, onClose, onSuccess }) {
  const { mutate: updatePersona, loading, error } = usePutPersona({
    id: persona.uuid,
  });
  const [frame] = useState('submit');

  return (
    <Modal title="Unlock persona">
      <div className="block-panel-remove-modal">
        {frame === 'submit' ? (
          <Fragment>
            <p>
              Are you sure to want to unlock <em>{persona.name}</em>?
            </p>

            <Controls
              error={error} // #FIXME
            >
              <Button
                disabled={loading}
                onClick={() => {
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={loading}
                isWaiting={loading}
                onClick={() => {
                  updatePersona({ isLocked: false })
                    .then(() => {
                      alert(`Successfully unlocked ${persona.name}`);
                      onClose();
                      return onSuccess(persona);
                    })
                    .catch(err => alert(`An error occurred: ${err.message}`));
                }}
              >
                Unlock
              </Button>
            </Controls>
          </Fragment>
        ) : (
          <Fragment>
            <p>
              <em>{persona.name}</em> was successfully unlocked.
            </p>

            <Controls
              error={error} // #FIXME
            >
              <Button
                disabled={loading}
                onClick={() => {
                  onClose();
                }}
              >
                Close
              </Button>
            </Controls>
          </Fragment>
        )}
      </div>
    </Modal>
  );
}

BlockPanelRemoveModal.propTypes = {
  user: PropTypes.object.isRequired,
  persona: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
