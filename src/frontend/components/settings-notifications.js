// base imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useHistory } from 'react-router-dom';
import {
  usePutUserContacts,
  usePostUserContacts,
  useDeleteUserContacts,
} from '../hooks/api-hooks.tsx';

// components
import Controls from './controls';
import Modal from './modal';
import TextInput from './text-input';
import ToggleSwitch from './toggle-switch';

// MaterialUI components
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Delete from '@material-ui/icons/Delete';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

// icons
import { MdInfoOutline } from 'react-icons/md';

const useStyles = makeStyles(theme => ({
  button: {
    textTransform: 'none',
  },
}));

export default function SettingsNotifications({ user }) {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [userContacts, setUserContacts] = useState(user ? user.contacts : []);
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);

  const params = new URLSearchParams(location.search);

  const { mutate: postContact } = usePostUserContacts({ id: user.uuid });

  const [modalType, setModalType] = useState(
    params.get('verified') === 'true' ? 'checked' : null,
  );

  function handleClose() {
    if (params.has('verified')) {
      history.replace({
        pathname: location.pathname,
      });
    }
    setModalType(null);
  }

  useEffect(() => {}, [userContacts]);

  return (
    <section className="settings-notifications settings__section">
      <h3 className="settings__title">
        Email settings and enabling notifications
      </h3>

      <p className="settings-notifications__notice">
        <MdInfoOutline className="settings-notifications__notice-icon" />
        <span>
          Enabling notifications ensures that you receive an email every time a
          review is added to a preprint for which you requested reviews. The
          email will only be displayed on your public profile if you choose to
          display it.
        </span>
      </p>

      <TableContainer>
        <Table stickyHeader className={classes.table} aria-label="keys table">
          <TableHead>
            <TableRow>
              <TableCell className="settings__notification-list-header">
                Email
              </TableCell>
              <TableCell className="settings__notification-list-header">
                Receive Notifications
              </TableCell>
              <TableCell className="settings__notification-list-header">
                Display on Profile
              </TableCell>
              <TableCell>Delete Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userContacts.length
              ? userContacts.map(contact => (
                  <EmailToggle
                    key={contact.uuid}
                    userId={user.uuid}
                    contact={contact}
                    onDelete={() => {
                      setUserContacts(
                        userContacts.filter(c => c.uuid !== contact.uuid),
                      );
                      return;
                    }}
                  />
                ))
              : null}
          </TableBody>
        </Table>
      </TableContainer>

      <div className="settings-notifications__email">
        <TextInput
          label="Add an email address"
          type="email"
          value={email}
          className="settings-notifications__email-input"
          onChange={e => {
            const isValid = !e.target.validity.typeMismatch;
            setEmail(e.target.value);
            setIsEmailValid(isValid);
          }}
        />
      </div>

      <Controls>
        <Button
          className={classes.button}
          color="primary"
          variant="contained"
          disabled={!isEmailValid || !email}
          onClick={() => {
            postContact({
              value: email,
              schema: 'mailto',
            })
              .then(resp => {
                let newContact = resp.data;
                setUserContacts(userContacts.concat([newContact]));
                // FIXME: update user context
                setEmail('');
                return;
              })
              .catch(err => alert(`An error occurred: ${err.message}`));
            setModalType('verifying');
          }}
        >
          Add email address
        </Button>
      </Controls>

      {!!modalType && (
        <Modal title="Info" showCloseButton={true} onClose={handleClose}>
          <p>
            {modalType === 'checked'
              ? 'The email address was successfully verified.'
              : modalType === 'verifying'
              ? 'An email with a verification link has been sent. Please check your inbox and follow the instructions.'
              : 'An email must be set to be able to receive notifications.'}
          </p>

          <Controls>
            <Button onClick={handleClose}>Close</Button>
          </Controls>
        </Modal>
      )}
    </section>
  );
}

SettingsNotifications.propTypes = {
  user: PropTypes.object.isRequired,
};

function EmailToggle({ userId, contact, onDelete }) {
  const [isNotify, setIsNotify] = useState(contact.isNotified);
  const [isPublic, setIsPublic] = useState(contact.isPublic);
  const { mutate: updateContact, loading } = usePutUserContacts({
    id: userId,
    cid: contact.uuid,
  });

  const { mutate: deleteContact } = useDeleteUserContacts({
    id: userId,
    queryParams: {
      cid: contact.uuid,
    },
  });
  return (
    <TableRow key={contact.uuid}>
      <TableCell>
        <div className="settings__notifications-list-item__active-state">
          {`${contact.value}`}
        </div>
      </TableCell>
      <TableCell>
        <div className="settings-notifications__toggle">
          <ToggleSwitch
            id={`notify-switch-${contact.uuid}`}
            disabled={loading}
            checked={isNotify}
            onChange={() => {
              updateContact({
                isNotified: !isNotify,
                schema: contact.schema,
                value: contact.value,
              })
                .then(() => {
                  setIsNotify(!isNotify);
                })
                .catch(err => alert(`An error occurred: ${err.message}`));
            }}
          />
        </div>
      </TableCell>
      <TableCell>
        <div className="settings-notifications__toggle">
          <ToggleSwitch
            id={`public-switch-${contact.uuid}`}
            disabled={loading}
            checked={isPublic}
            onChange={() => {
              updateContact({
                isPublic: !isPublic,
                schema: contact.schema,
                value: contact.value,
              })
                .then(() => {
                  setIsPublic(!isPublic);
                })
                .catch(err => alert(`An error occurred: ${err.message}`));
            }}
          />
        </div>
      </TableCell>
      <TableCell>
        <div className="settings-notifications__toggle">
          <IconButton
            onClick={() => {
              if (
                confirm('Are you sure you want to delete this email address?')
              ) {
                deleteContact()
                  .then(() => {
                    onDelete();
                    alert('Contact info deleted successfully.');
                  })
                  .catch(err => alert(`An error occurred: ${err.message}`));
              }
            }}
          >
            <Delete />
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  );
}
