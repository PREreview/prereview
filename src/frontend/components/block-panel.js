import React, { Fragment, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import { MdClose } from 'react-icons/md';
import { UserContext } from '../contexts/user-context';
// import { getId, unprefix } from '../utils/jsonld';
import HeaderBar from './header-bar';
import { ORG } from '../constants';
// import { createLockedRolesQs } from '../utils/search';
// import { useRolesSearchResults, usePostAction } from '../hooks/api-hooks.tsx';
import { useGetPersonas, usePutPersona } from '../hooks/api-hooks.tsx';
import Button from './button';
import IconButton from './icon-button';
import { RoleBadgeUI } from './role-badge';
import LabelStyle from './label-style';
import Modal from './modal';
import TextInput from './text-input';
import Controls from './controls';

export default function BlockPanel() {
  const user = useContext(UserContext);
  const [lockedPersonas, setLockedPersonas] = useState([]);
  const [personaToUnlock, setPersonaToUnlock] = useState(null)

  const { data: personas, loadingPersonas } = useGetPersonas()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

   useEffect(() => {
    if (!loadingPersonas) {
      if (personas && personas.data) {
        setLockedPersonas(personas.data.filter(persona => persona.isLocked))
      }
    }
  }, [loadingPersonas, personas, user]);

  return (
    <div className="block-panel">
      <Helmet>
        <title>{ORG} • Moderate Users</title>
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
            Block persona
          </Button>
        </header>

        {lockedPersonas ? (
         !lockedPersonas.length ? (
          <div>No Locked persona.</div>
        ) : (
          <div>
            <ul className="block-panel__card-list">
              {lockedPersonas.map(persona => (
                  <li key={persona.id} className="block-panel__card-list-item">
                    <div className="block-panel__card-list-item__left">
                      <RoleBadgeUI user={persona} />
                      <span>{persona.name}</span>
                    </div>
                    <div className="block-panel__card-list-item__right">
                      <LabelStyle>
                        { persona.isAnonymous ? 'Anonymous' : 'Public' }
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
        )) : null }
      </section>

      {isAddModalOpen && (
        <BlockPanelAddModal
          user={user}
          onClose={() => {
            setIsAddModalOpen(false);
          }}
          onSuccess={Locked => setLockedPersonas(lockedPersonas.concat(Locked))}
        />
      )}

      {
        !!personaToUnlock ? 
        <BlockPanelRemoveModal
          user={user}
          persona={personaToUnlock}
          onClose={() => {
            setPersonaToUnlock(null);
          }}
          onSuccess={ unlocked => {
            setLockedPersonas(lockedPersonas.filter(persona => persona.id !== unlocked.id))
          }}
        /> : null
      }
    </div>
  );
}

function BlockPanelAddModal({ user, onClose, onSuccess }) {
  const [personaToLock, setPersonaToLock] = useState('');
  const { mutate: updatePersona, loading, error } = usePutPersona({
    id: personaToLock,
  }); 
  const [frame] = useState('input');

  const pattern =
    '^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$'; // uuid v4
  const re = new RegExp(pattern, 'i');

  return (
    <Modal title="Block persona">
      <div className="block-panel-add-modal">
        {frame === 'input' ? (
          <Fragment>
            <TextInput
              inputId="step-preprint-input-new"
              label={<span>Enter a persona ID</span>}
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
                    .then((resp) => {
                        let locked = resp.data
                        alert(`Persona successfully locked`)
                        onSuccess(locked)
                        onClose()
                      }
                    )
                    .catch(err => alert(`An error occurred: ${err}`));
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
  user: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

function BlockPanelRemoveModal({ user, persona, onClose, onSuccess }) {
  const { mutate: updatePersona, loading, error } = usePutPersona({
    id: persona.id
  }); 
  const [frame] = useState('submit');

  return (
    <Modal title="Unlock persona">
      <div className="block-panel-remove-modal">
        {frame === 'submit' ? (
          <Fragment>
            <p>
              Are you sure to want to unlock{' '}
              <em>{persona.name}</em>?
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
                      alert(`Successfully unlocked ${persona.name}`)
                      onClose()
                      onSuccess(persona)
                    })
                    .catch(err => alert(`An error occurred: ${err}`));
                }}
              >
                Unlock
              </Button>
            </Controls>
          </Fragment>
        ) : (
          <Fragment>
            <p>
              <em>{persona.name}</em> was successfully
              unlocked.
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
