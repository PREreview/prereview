import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Org from './org';
import XLink from './xlink';
import Controls from './controls';
import Button from './button';
import { UpdateKeys } from '../hooks/api-hooks.tsx'; // #FIXME need to build this

export default function SettingsApi({ user }) {
  const updateKeys = UpdateKeys();

  const handleSubmit = () => {
    updateKeys(user)
      .then(() => alert('API key successfully updated.'))
      .catch(err => alert(`An error occurred: ${err}`));
  };

  return (
    <section className="settings-api settings__section">
      <h3 className="settings__title">API key</h3>

      <p>
        An API key lets you create requests for reviews using the <Org />{' '}
        <XLink href="/api" to="/api">
          API
        </XLink>
        .
      </p>

      {user.apiKey ? (
        <div>
          <p>
            <Secret value={user.apiKey.value} />
          </p>

          <Controls
            error={updateKeys.error} // #FIXME
          >
            <Button
              onClick={handleSubmit}
              disabled={updateKeys.loading}
              isWaiting={updateKeys.loading}
            >
              Regenerate API key
            </Button>
          </Controls>
        </div>
      ) : (
        <div>
          <Controls
            error={updateKeys.error} // #FIXME
          >
            <Button
              onClick={handleSubmit}
              disabled={updateKeys.loading}
              isWaiting={updateKeys.loading}
            >
              Create API key
            </Button>
          </Controls>
        </div>
      )}
    </section>
  );
}

SettingsApi.propTypes = {
  user: PropTypes.object.isRequired,
};

function Secret({ value, defaultIsVisible = false }) {
  const [isVisible, setIsVisible] = useState(defaultIsVisible);

  const [prefix, ...others] = value.split('-');
  const suffix = others.join('-');

  const displayedValue = isVisible
    ? value
    : `${value.substring(0, prefix.length)}-${'∙'.repeat(suffix.length)}`;

  return (
    <span className="settings-api__secret">
      <code>{displayedValue}</code>

      <Button
        onClick={() => {
          setIsVisible(!isVisible);
        }}
      >
        {isVisible ? 'Hide' : 'View'}
      </Button>
    </span>
  );
}

Secret.propTypes = {
  value: PropTypes.string.isRequired,
  defaultIsVisible: PropTypes.bool,
};
