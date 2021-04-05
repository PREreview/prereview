// base imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useHistory } from 'react-router-dom';
import { usePutUserContacts, usePostUserContacts, useDeleteUserContacts } from '../hooks/api-hooks.tsx';

// components
import Controls from './controls';
import Modal from './modal';
import TextInput from './text-input';
import ToggleSwitch from './toggle-switch';

// MaterialUI components
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import MuiTooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

// icons
import CloseIcon from '@material-ui/icons/Close';
import Delete from '@material-ui/icons/Delete';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

const Tooltip = withStyles(theme => ({
  tooltip: {
    fontSize: theme.typography.pxToRem(16),
    padding: 10,
  },
}))(MuiTooltip);

const useStyles = makeStyles(() => ({
  button: {
    marginLeft: 10,
    padding: 10,
  },
  close: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 50,
  },
  textField: {
    minWidth: 300,
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

  useEffect(() => { }, [userContacts]);

  return (
    <>
      <Typography variant="h3" component="h2">
        Email settings and enabling notifications
        <Tooltip title="Enabling notifications ensures that you receive an email every time a review is added to a preprint for which you requested reviews. The email provided will only be used for notifications and will never be shared.">
          <IconButton>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Typography>

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

      <Box>
        <TextField
          className={classes.textField}
          label="Email address"
          type="email"
          variant="outlined"
          value={email}
          onChange={e => {
            const isValid = !e.target.validity.typeMismatch;
            setEmail(e.target.value);
            setIsEmailValid(isValid);
          }}
        />
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
          Add
        </Button>
      </Box>

      {!!modalType && (
        <Dialog aria-label="email-verification" onClose={handleClose}>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            className={classes.close}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="body1">
            {modalType === 'checked'
              ? 'The email address was successfully verified.'
              : modalType === 'verifying'
              ? 'An email with a verification link has been sent. Please check your inbox and follow the instructions.'
              : 'An email must be set to be able to receive notifications.'}
          </Typography>

          <Controls>
            <Button onClick={handleClose}>Close</Button>
          </Controls>
        </Dialog>
      )}
    </>
  );
}

SettingsNotifications.propTypes = {
  user: PropTypes.object.isRequired,
};

function EmailToggle({ userId, contact, onDelete }) {
  const [toggle, setToggle] = useState(contact.isNotified)
  const { mutate: updateContact, loading } = usePutUserContacts({
    id: userId,
    cid: contact.uuid,
  });

  const { mutate: deleteContact } = useDeleteUserContacts({
    id: userId,
    queryParams: {
      cid: contact.uuid
    }
  });
  return (
    <div className="settings-notifications__toggle">
      <span>{`${contact.value}`}</span>
      <ToggleSwitch
        id="notification-switch"
        disabled={loading}
        checked={toggle}
        onChange={() => {
          updateContact(
            {
              isNotified: !toggle,
              schema: contact.schema,
              value: contact.value,
            })
            .then(() => {
              setToggle(!toggle);
            })
            .catch(err => alert(`An error occurred: ${err.message}`));
        }}
      />
      <IconButton onClick={() => {
        if (confirm('Are you sure you want to delete this email address?')) {
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
  );
}
