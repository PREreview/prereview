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
import ToggleSwitch from './toggle-switch';

// MaterialUI components
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import MuiTooltip from '@material-ui/core/Tooltip';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import MuiTableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

// icons
import CloseIcon from '@material-ui/icons/Close';
import Delete from '@material-ui/icons/Delete';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

const TableRow = withStyles(theme => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(MuiTableRow);

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

  useEffect(() => {}, [userContacts]);

  return (
    <>
      <Typography variant="h3" component="h2">
        Email settings and enabling notifications
        <Tooltip title="Enabling notifications ensures that you receive an email every time a PREreview is added to a preprint for which you requested PREreviews. The email provided will only be used for notifications and will never be shared.">
          <IconButton>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Typography>

      <Box my={4}>
        <Table className={classes.table} aria-label="Email addresses table">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography component="span" variant="body2">
                  Email address
                </Typography>
              </TableCell>
              <TableCell>
                <Typography component="span" variant="body2">
                  Turn on/off notifications
                </Typography>
              </TableCell>
              <TableCell>
                <Typography component="span" variant="body2">
                  Display on Profile
                </Typography>
              </TableCell>
              <TableCell>
                <Typography component="span" variant="body2">
                  Delete
                </Typography>
              </TableCell>
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
      </Box>
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
    <TableRow>
      <TableCell>
        <Typography component="span" variant="body1">
          {`${contact.value}`}
        </Typography>
      </TableCell>
      <TableCell>
        <ToggleSwitch
          id={`notify-switch-${contact.uuid}`}
          name={`notify-switch-${contact.uuid}`}
          checked={isNotify}
          label="Turn on or off email notifications"
          inputProps={{ 'aria-label': 'turn on or off email notification' }}
          onChange={() => {
            updateContact({
              isNotified: !isNotify,
              schema: contact.schema,
              value: contact.value,
            })
              .then(() => {
                return setIsNotify(!isNotify);
              })
              .then(() => {
                return setIsNotify(!isNotify);
              })
              .catch(err => alert(`An error occurred: ${err.message}`));
          }}
        />
      </TableCell>
      <TableCell>
        <ToggleSwitch
          id={`public-switch-${contact.uuid}`}
          name={`public-switch-${contact.uuid}`}
          checked={isPublic}
          inputProps={{ 'aria-label': 'display email on profile' }}
          onChange={() => {
            updateContact({
              isPublic: !isPublic,
              schema: contact.schema,
              value: contact.value,
            })
              .then(() => {
                return setIsPublic(!isPublic);
              })
              .catch(err => alert(`An error occurred: ${err.message}`));
          }}
        />
      </TableCell>
      <TableCell>
        <IconButton
          onClick={() => {
            if (
              confirm('Are you sure you want to delete this email address?')
            ) {
              deleteContact()
                .then(() => {
                  onDelete();
                  return alert('Contact info deleted successfully.');
                })
                .catch(err => alert(`An error occurred: ${err.message}`));
            }
          }}
        >
          <Delete />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

EmailToggle.propTypes = {
  userId: PropTypes.string,
  contact: PropTypes.string,
  onDelete: PropTypes.func,
};
