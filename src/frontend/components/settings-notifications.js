// base imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useHistory } from 'react-router-dom';

// hooks
import {
  usePutUserContacts,
  usePostUserContacts,
} from '../hooks/api-hooks.tsx';

// components
import Controls from './controls';
import Modal from './modal';
import TextInput from './text-input';
import ToggleSwitch from './toggle-switch';

// MaterialUI components
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

// icons
import { MdInfoOutline } from 'react-icons/md';

const useStyles = makeStyles(theme => ({
  button: {
    textTransform: 'none',
  },
}));

export default function SettingsNotifications({ user, error }) {
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
      <h3 className="settings__title">Enable notifications</h3>

      <p className="settings-notifications__notice">
        <MdInfoOutline className="settings-notifications__notice-icon" />
        <span>
          Enabling notifications ensures that you receive an email every time a
          review is added to a preprint for which you requested reviews. The
          email provided will only be used for notifications and will never be
          shared.
        </span>
      </p>

      {userContacts.length
        ? userContacts.map(contact => (
            <EmailToggle
              key={contact.uuid}
              userId={user.uuid}
              contact={contact}
            />
          ))
        : null}

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

        {/* <IconButton
          onClick={() => {
            setModalType(
              userContacts
                ? 'checked'
                : userContacts
                ? 'verifying'
                : 'empty',
            );
          }}
        >
          {userContacts ? (
            <MdCheck className="settings-notifications__email-icon" />
          ) : (
            <MdWarning className="settings-notifications__email-icon" />
          )}
        </IconButton> */}
      </div>

      <Controls
        error={error} // #FIXME
      >
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
  error: PropTypes.object,
};

function EmailToggle({ userId, contact }) {
  const { mutate: updateUser, loading } = usePutUserContacts({
    id: userId,
    cid: contact.uuid,
  });

  return (
    <div className="settings-notifications__toggle">
      <span>{`${contact.value}`}</span>
      <ToggleSwitch
        id="notification-switch"
        disabled={loading}
        checked={contact.sendNotifications}
        onChange={() => {
          updateUser({
            sendNotifications: !contact.sendNotifications,
          })
            .then(() => alert('Contact info updated successfully.'))
            .catch(err => alert(`An error occurred: ${err.message}`));
        }}
      />
    </div>
  );
}

EmailToggle.propTypes = {
  userId: PropTypes.string,
  contact: PropTypes.object,
};
