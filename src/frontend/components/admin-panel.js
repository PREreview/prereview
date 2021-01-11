// base imports
import React, { Fragment, useContext, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

// contexts
import { UserContext } from '../contexts/user-context';

// utils
import { getId } from '../utils/jsonld';

// hooks
import {
  useDeleteGroupMember,
  useGetGroup,
  usePutGroupMember,
} from '../hooks/api-hooks.tsx';

// components
import Button from './button';
import Controls from './controls';
import HeaderBar from './header-bar';
import IconButton from './icon-button';
import LabelStyle from './label-style';
import Loading from './loading';
import Modal from './modal';
import { RoleBadgeUI } from './role-badge';
import TextInput from './text-input';

// constants
import { ORG } from '../constants';

// icons
import { MdClose } from 'react-icons/md';

export default function AdminPanel() {
  const user = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [moderators, setModerators] = useState(null);

  const { data: groupData, loadingGroup } = useGetGroup({
    id: 'moderators',
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [revokeRole, setRevokeRole] = useState(null);
  const [revokeRolePersona, setRevokeRolePersona] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [moderators]);

  useEffect(() => {
    if (!loadingGroup) {
      if (groupData && groupData.data[0]) {
        setGroup(groupData.data[0]);
        setModerators(groupData.data[0].members);
        setLoading(false);
      }
    }
  }, [loadingGroup, groupData, user]);

  if (loading) {
    return <Loading />;
  } else {
    return (
      <div className="admin-panel">
        <Helmet>
          <title>{ORG} • Admin panel</title>
        </Helmet>
        <HeaderBar thisUser={user} />

        <section>
          <header className="admin-panel__header">
            <span>Manage moderators</span>
            <Button
              primary={true}
              onClick={() => {
                setIsAddModalOpen(true);
              }}
            >
              Add moderator
            </Button>
          </header>

          {!group.members.length ? (
            <div>No moderators.</div>
          ) : (
            <div>
              <ul className="admin-panel__card-list">
                {moderators.map(moderator => {
                  if (moderator.defaultPersona) {
                    return (
                      <li
                        key={moderator.id}
                        className="admin-panel__card-list-item"
                      >
                        <div className="admin-panel__card-list-item__left">
                          <RoleBadgeUI user={moderator} />
                          <span>{moderator.defaultPersona.name}</span>
                        </div>
                        <div className="admin-panel__card-list-item__right">
                          <LabelStyle>
                            {!moderator.defaultPersona.isAnonymous ? 'Public' : 'Anonymous'}
                          </LabelStyle>
                          <IconButton
                            className="admin-panel__remove-button"
                            onClick={() => {
                              setRevokeRole(moderator);
                              setRevokeRolePersona(moderator.defaultPersona);
                            }}
                          >
                            <MdClose className="admin-panel__remove-button-icon" />
                          </IconButton>
                        </div>
                      </li>
                    );
                  }
                })}
              </ul>
            </div>
          )}
        </section>

        {isAddModalOpen && (
          <AdminPanelAddModal
            group={group.id}
            onClose={() => {
              setIsAddModalOpen(false);
            }}
            onSuccess={mods => {
              setModerators(mods);
            }}
          />
        )}

        {!!revokeRole && (
          <AdminPanelRemoveModal
            group={group}
            userToDelete={revokeRole}
            personaToDelete={revokeRolePersona}
            onClose={() => {
              setRevokeRole(null);
              setRevokeRolePersona(null);
            }}
            onSuccess={user => {
              const filteredMods = moderators.filter(
                moderator => moderator.id !== user.id,
              );
              setModerators(filteredMods);
            }}
          />
        )}
      </div>
    );
  }
}

function AdminPanelAddModal({ group, onClose, onSuccess }) {
  const [value, setValue] = useState('');
  const { mutate: updateGroupMember, loading, error } = usePutGroupMember({
    id: group,
    uid: value,
  });
  const [frame, setFrame] = useState('input');

  return (
    <Modal title="Add Moderator">
      <div className="admin-panel-add-modal">
        {frame === 'input' ? (
          <Fragment>
            <TextInput
              inputId="step-preprint-input-new"
              label={<span>Enter a user ID or ORCID</span>}
              minimal={true}
              autoComplete="off"
              disabled={loading}
              placeholder=""
              onChange={e => {
                const value = e.target.value;
                setValue(value);
              }}
              value={value}
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
                onClick={() => {
                  updateGroupMember({ id: group, uid: value })
                    .then(response => {
                      console.log(response.data.members);
                      onSuccess(response.data.members);
                      return onClose();
                    })
                    .catch(err => alert(`An error occurred: ${err.message}`));
                }}
              >
                Add
              </Button>
            </Controls>
          </Fragment>
        ) : (
          <Fragment>
            <p>The user was successfully granted moderator permission.</p>

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

AdminPanelAddModal.propTypes = {
  group: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

function AdminPanelRemoveModal({
  userToDelete,
  personaToDelete,
  group,
  onClose,
  onSuccess,
}) {
  const { mutate: deleteGroupMember, loading, error } = useDeleteGroupMember({
    id: group.id,
    uid: userToDelete.id,
  });
  const [frame, setFrame] = useState('submit');

  return (
    <Modal title="Revoke Moderator Permission">
      <div className="admin-panel-remove-modal">
        {frame === 'submit' ? (
          <Fragment>
            <p>
              Are you sure to want to revoke moderator permission for{' '}
              <em>
                {personaToDelete.name ||
                  personaToDelete.orcid ||
                  personaToDelete.id}
              </em>
              ?
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
                  deleteGroupMember({ id: group.id, uid: userToDelete.id })
                    .then(() => {
                      onSuccess(userToDelete);
                      return onClose();
                    })
                    .catch(err => alert(`An error occurred: ${err.message}`));
                }}
              >
                Revoke
              </Button>
            </Controls>
          </Fragment>
        ) : (
          <Fragment>
            <p>
              The moderator permission was successfuly revoked for role
              (persona)
              <em>
                {personaToDelete.name ||
                  personaToDelete.orcid ||
                  personaToDelete.id}
              </em>
              .
            </p>

            <Controls
              error={error} // #FIXME
            >
              <Button
                disabled={updateUserRole.loading}
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

AdminPanelRemoveModal.propTypes = {
  userToDelete: PropTypes.object.isRequired,
  personaToDelete: PropTypes.object.isRequired,
  group: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
