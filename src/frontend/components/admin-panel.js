// base imports
import React, { Fragment, useContext, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

// contexts
import { UserContext } from '../contexts/user-context';

// utils
import { getId, unprefix } from '../utils/jsonld';
import { createModeratorQs } from '../utils/search';

// hooks
import {
  useGetGroups,
  usePostGroups,
  usePutUser,
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

const searchParamsToObject = params => {
  const obj = {};
  for (const [key, value] of params) {
    obj[key] = value;
  }
  return obj;
};

export default function AdminPanel() {
  const user = useContext(UserContext);
  const [bookmark, setBookmark] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState(null);

  const search = createModeratorQs({ bookmark });

  const { data: groupsData, loadingGroups, error } = useGetGroups({
    queryParams: searchParamsToObject(search),
  });

  const [moderators, setModerators] = useState([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [revokeRole, setRevokeRole] = useState(null);

  const [excluded, setExcluded] = useState(new Set());
  const [added, setAdded] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!loadingGroups) {
      if (groupsData) {
        let filteredModerators = [];
        groupsData.data.map(group => {
          group.members.map(member => {
            filteredModerators = [...filteredModerators, member];
          });
        });
        filteredModerators = filteredModerators.filter(
          (moderator, index, self) =>
            self.findIndex(m => m.id === moderator.id) === index,
        );
        setModerators(filteredModerators);
        setGroups(groupsData.data);
        setLoading(false);
      }
    }
  }, [loadingGroups, groupsData, user]);

  if (loading) {
    return <Loading />;
  } else {
    return (
      <div className="admin-panel">
        <Helmet>
          <title>{ORG} • Admin panel</title>
        </Helmet>
        <HeaderBar />

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

          {!moderators.length ? (
            <div>No moderators.</div>
          ) : (
            <div>
              <ul className="admin-panel__card-list">
                {moderators.map(moderator => {
                  moderator.personas.map(persona => {
                    console.log('person: ', persona);
                    if (moderator.defaultPersona === persona.id) {
                      return (
                        <li
                          key={persona.id}
                          className="admin-panel__card-list-item"
                        >
                          <div className="admin-panel__card-list-item__left">
                            <RoleBadgeUI user={persona} />
                            <span>{persona.name}</span>
                          </div>
                          <div className="admin-panel__card-list-item__right">
                            <LabelStyle>
                              {persona.isActive ? 'Public' : 'Anonymous'}
                            </LabelStyle>
                            <IconButton
                              className="admin-panel__remove-button"
                              onClick={() => {
                                setRevokeRole(moderator);
                              }}
                            >
                              <MdClose className="admin-panel__remove-button-icon" />
                            </IconButton>
                          </div>
                        </li>
                      );
                    }
                  });
                })}
              </ul>
            </div>
          )}
        </section>

        {isAddModalOpen && (
          <AdminPanelAddModal
            user={user}
            onClose={() => {
              setIsAddModalOpen(false);
            }}
            onSuccess={action => {
              setAdded(added.concat(action.result));
            }}
          />
        )}

        {!!revokeRole && (
          <AdminPanelRemoveModal
            user={user}
            role={revokeRole}
            onClose={() => {
              setRevokeRole(null);
            }}
            onSuccess={action => {
              setExcluded(
                new Set(Array.from(excluded).concat(getId(action.result))),
              );
            }}
          />
        )}
      </div>
    );
  }
}

function AdminPanelAddModal({ user, onClose, onSuccess }) {
  const [value, setValue] = useState('');
  const postGroup = usePostGroups();
  const [frame, setFrame] = useState('input');

  const pattern =
    '^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$'; // uuid v4
  const re = new RegExp(pattern, 'i');

  return (
    <Modal title="Add Moderator">
      <div className="admin-panel-add-modal">
        {frame === 'input' ? (
          <Fragment>
            <TextInput
              inputId="step-preprint-input-new"
              label={<span>Enter a role (persona) ID</span>}
              minimal={true}
              autoComplete="off"
              disabled={postGroup.loading}
              placeholder=""
              pattern={pattern}
              onChange={e => {
                const value = e.target.value;
                setValue(value);
              }}
              value={value}
            />

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
                disabled={postGroup.loading || !re.test(value)}
                isWaiting={postGroup.loading}
                onClick={() => {
                  postGroup(user, value)
                    .then(() => alert('Role posted successfully.'))
                    .catch(err => alert(`An error occurred: ${err}`));
                  onSuccess(value);
                }}
              >
                Add
              </Button>
            </Controls>
          </Fragment>
        ) : (
          <Fragment>
            <p>
              The role (persona) was successfully granted moderator permission.
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

AdminPanelAddModal.propTypes = {
  user: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

function AdminPanelRemoveModal({ user, role, onClose, onSuccess }) {
  const updateUserRole = usePutUser();
  const [frame, setFrame] = useState('submit');

  return (
    <Modal title="Revoke Moderator Permission">
      <div className="admin-panel-remove-modal">
        {frame === 'submit' ? (
          <Fragment>
            <p>
              Are you sure to want to revoke moderator permission for role
              (persona) <em>{role.name || unprefix(getId(role))}</em>?
            </p>

            <Controls
              error={updateUserRole.error} // #FIXME
            >
              <Button
                disabled={updateUserRole.loading}
                onClick={() => {
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={updateUserRole.loading}
                isWaiting={updateUserRole.loading}
                onClick={() => {
                  updateUserRole(user, role)
                    .then(() => alert('User role updated successfully.'))
                    .catch(err => alert(`An error occurred: ${err}`));
                  onSuccess(role);
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
              (persona) <em>{role.name || unprefix(getId(role))}</em>.
            </p>

            <Controls
              error={updateUserRole.error} // #FIXME
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
  user: PropTypes.object.isRequired,
  role: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
