import React, { Fragment, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import { MdClose } from 'react-icons/md';
import { UserContext } from '../contexts/user-context';
import { getId, unprefix } from '../utils/jsonld';
import HeaderBar from './header-bar';
import { ORG } from '../constants';
import { createBlockedRolesQs } from '../utils/search';
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
  const [loading, setLoading] = useState(true);
  const [blockedPersonas, setBlockedPersonas] = useState([]);

  const { data: personas, loadingPersonas } = useGetPersonas()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

   useEffect(() => {
    if (!loadingPersonas) {
      if (personas && personas.data) {
        setBlockedPersonas(personas.data.filter(persona => persona.isLocked))
        setLoading(false);
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
          <span>Blocked Personas</span>
          <Button
            primary={true}
            onClick={() => {
              setIsAddModalOpen(true);
            }}
          >
            Block persona
          </Button>
        </header>

        { blockedPersonas ? (
         !blockedPersonas.length ? (
          <div>No blocked persona.</div>
        ) : (
          <div>
            <ul className="block-panel__card-list">
              { blockedPersonas.map(persona => (
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
                          // FIXME!!!!
                          // setUnmoderatedRole(role);
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

        {/* <div className="block-panel__page-nav">
          {!!(
            groups.rows.length < groups.total_rows &&
            groups.bookmark !== bookmark
          ) && (
            <Button
              onClick={e => {
                e.preventDefault();
                setBookmark(groups.bookmark);
              }}
            >
              More
            </Button>
          )}
        </div> */}
      </section>

      {isAddModalOpen && (
        <BlockPanelAddModal
          user={user}
          onClose={() => {
            setIsAddModalOpen(false);
          }}
          onSuccess={blocked => setBlockedPersonas(blockedPersonas.concat(blocked))}
        />
      )}

      {/* {!!unmoderatedRole && (
        <BlockPanelRemoveModal
          user={user}
          role={unmoderatedRole}
          onClose={() => {
            setUnmoderatedRole(null);
          }}
          onSuccess={action => {
            setExcluded(
              new Set(Array.from(excluded).concat(getId(action.result))),
            );
          }}
        />
      )} */}
    </div>
  );
}

function BlockPanelAddModal({ user, onClose, onSuccess }) {
  const [personaToBlock, setPersonaToBlock] = useState('');
  const { mutate: updatePersona, loading, error } = usePutPersona({
    id: personaToBlock,
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
              label={<span>Enter a role (persona) ID</span>}
              minimal={true}
              autoComplete="off"
              disabled={loading}
              placeholder=""
              pattern={pattern}
              onChange={e => {
                const value = e.target.value;
                setPersonaToBlock(value);
              }}
              value={personaToBlock}
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
                        let blocked = resp.data
                        alert(`Persona successfully locked`)
                        onSuccess(blocked)
                        onClose()
                      }
                    )
                    .catch(err => alert(`An error occurred: ${err}`));
                }}
              >
                Block
              </Button>
            </Controls>
          </Fragment>
        ) : (
          <Fragment>
            <p>The role (persona) has been successfully blocked.</p>

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

function BlockPanelRemoveModal({ user, role, onClose, onSuccess }) {
  const postGroup = usePostGroups();
  const [frame] = useState('submit');

  return (
    <Modal title="Revoke Moderator Permission">
      <div className="block-panel-remove-modal">
        {frame === 'submit' ? (
          <Fragment>
            <p>
              Are you sure to want to unblock{' '}
              <em>{role.name || unprefix(getId(role))}</em>?
            </p>

            <Controls
              error={postGroup.error} // #FIXME
            >
              <Button
                disabled={postGroup.loading}
                onClick={() => {
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={postGroup.loading}
                isWaiting={postGroup.loading}
                onClick={() => {
                  postGroup(user, role)
                    .then(() => alert('Role posted successfully.'))
                    .catch(err => alert(`An error occurred: ${err}`));
                  onSuccess(role);
                }}
              >
                Unblock
              </Button>
            </Controls>
          </Fragment>
        ) : (
          <Fragment>
            <p>
              <em>{role.name || unprefix(getId(role))}</em> was successfully
              unblocked.
            </p>

            <Controls
              error={postGroup.error} // #FIXME
            >
              <Button
                disabled={postGroup.loading}
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
  role: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
