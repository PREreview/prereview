import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import { MdClose } from 'react-icons/md';
import { useUser } from '../contexts/user-context';
import { getId, unprefix } from '../utils/jsonld';
import HeaderBar from './header-bar';
import { ORG } from '../constants';
import { createModeratorQs } from '../utils/search';
import {
  GetGroups,
  PostGroups,
  UpdateUserRole, // #FIXME need to build this
} from '../hooks/api-hooks.tsx';
import Button from './button';
import IconButton from './icon-button';
import { RoleBadgeUI } from './role-badge';
import LabelStyle from './label-style';
import Modal from './modal';
import TextInput from './text-input';
import Controls from './controls';

export default function AdminPanel() {
  const [user] = useUser();
  const [bookmark, setBookmark] = useState(null);

  const search = createModeratorQs({ bookmark });

  const groups = GetGroups(search, !!bookmark);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [revokeRole, setRevokeRole] = useState(null);

  const [excluded, setExcluded] = useState(new Set());
  const [added, setAdded] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="admin-panel">
      <Helmet>
        <title>{ORG} • Admin panel</title>
      </Helmet>
      <HeaderBar closeGap />

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

        {groups.total_rows === 0 && !groups.loading && !added.length ? (
          <div>No moderators.</div>
        ) : (
          <div>
            <ul className="admin-panel__card-list">
              {added
                .concat(
                  groups.rows
                    .map(row => row.doc)
                    .filter(
                      role =>
                        !excluded.has(getId(role)) &&
                        !added.some(_role => getId(_role) === getId(role)),
                    ),
                )
                .map(role => (
                  <li key={getId(role)} className="admin-panel__card-list-item">
                    <div className="admin-panel__card-list-item__left">
                      <RoleBadgeUI role={role} />
                      <span>{role.name || unprefix(getId(role))}</span>
                    </div>
                    <div className="admin-panel__card-list-item__right">
                      <LabelStyle>
                        {role['@type'] === 'AnonymousReviewerRole'
                          ? 'Anonymous'
                          : 'Public'}
                      </LabelStyle>
                      <IconButton
                        className="admin-panel__remove-button"
                        onClick={() => {
                          setRevokeRole(role);
                        }}
                      >
                        <MdClose className="admin-panel__remove-button-icon" />
                      </IconButton>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <div className="admin-panel__page-nav">
          {/* Cloudant returns the same bookmark when it hits the end of the list */}
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
        </div>
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

function AdminPanelAddModal({ user, onClose, onSuccess }) {
  const [value, setValue] = useState('');
  const postGroups = PostGroups();
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
              disabled={postGroups.loading}
              placeholder=""
              pattern={pattern}
              onChange={e => {
                const value = e.target.value;
                setValue(value);
              }}
              value={value}
            />

            <Controls
              error={postGroups.error} // #FIXME
            >
              <Button
                disabled={postGroups.loading}
                onClick={() => {
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={postGroups.loading || !re.test(value)}
                isWaiting={postGroups.loading}
                onClick={() => {
                  postGroups(user, value)
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
              error={postGroups.error} // #FIXME
            >
              <Button
                disabled={postGroups.loading}
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
  const updateUserRole = UpdateUserRole();
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
