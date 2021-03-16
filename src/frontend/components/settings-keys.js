// base imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { usePostUserKey, useDeleteUserKeys } from '../hooks/api-hooks.tsx';

// components
import Controls from './controls';
import TextInput from './text-input';

// MaterialUI components
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Delete from '@material-ui/icons/Delete';

// icons
import { MdInfoOutline } from 'react-icons/md';

const useStyles = makeStyles(() => ({
  button: {
    textTransform: 'none',
  },
}));

export default function SettingsKeys({ user }) {
  const classes = useStyles();
  const [userKeys, setUserKeys] = useState(user ? user.keys : []);
  const [app, setApp] = useState('');
  const [isAppValid, setIsAppValid] = useState(true);

  const { mutate: postKey } = usePostUserKey({ id: user.uuid });

  useEffect(() => { }, [userKeys]);

  return (
    <section className="settings-keys settings__section">
      <h3 className="settings__title">API keys</h3>

      <p className="settings-keys__notice">
        <MdInfoOutline className="settings-keys__notice-icon" />
        <span>
          API keys allow an application to access this site with the same identity and privileges as your user account. <em>Please be careful who you share these keys with, and delete any that are no longer used or may be compromised.</em>
        </span>
      </p>

      {userKeys.length
        ? userKeys.map(credentials => (
          <ApiKey
            key={credentials.uuid}
            userId={user.uuid}
            credentials={credentials}
            onDelete={() => {
              setUserKeys(userKeys.filter(k => k.uuid !== credentials.uuid));
              return;
            }}
          />
        ))
        : null}

      <div className="settings-keys__name">
        <TextInput
          label="Choose a name to distinguish a new API key"
          value={app}
          className="settings-keys__name-input"
          onChange={e => {
            const isValid = !e.target.validity.typeMismatch;
            setApp(e.target.value);
            setIsAppValid(isValid);
          }}
        />
      </div>

      <Controls>
        <Button
          className={classes.button}
          color="primary"
          variant="contained"
          disabled={!isAppValid || !app}
          onClick={() => {
            postKey({
              app: app,
            })
              .then(resp => {
                let newKey = resp.data;
                setUserKeys(userKeys.concat([newKey]));
                // FIXME: update user context
                setApp('');
                return;
              })
              .catch(err => alert(`An error occurred: ${err.message}`));
            setModalType('verifying');
          }}
        >
          Add API Key
        </Button>
      </Controls>
    </section>
  );
}

SettingsKeys.propTypes = {
  user: PropTypes.object.isRequired,
};

function ApiKey({ userId, credentials, onDelete }) {
  const { mutate: deleteKey } = useDeleteUserKeys({
    id: userId,
    queryParams: {
      kid: credentials.uuid,
    },
  });
  return (
    <div className="settings-keys__delete">
      <span>{`${credentials.app}`}</span>
      <span>{`${credentials.secret}`}</span>
      <IconButton onClick={() => {
        if (confirm('Are you sure you want to delete this API key?')) {
          deleteKey()
              .then(() => {
                onDelete();
                alert('API key deleted successfully.');
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

ApiKey.propTypes = {
  userId: PropTypes.string.isRequired,
  credentials: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    app: PropTypes.string.isRequired,
    secret: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};
