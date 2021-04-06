// base imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useHistory } from 'react-router-dom';
import identifiersArxiv from 'identifiers-arxiv';
import doiRegex from 'doi-regex';

// utils
import { createPreprintId } from '../../common/utils/ids';
import { unversionDoi } from '../utils/ids';
import { unprefix } from '../utils/jsonld';

// hooks
import { usePreprint } from '../hooks/old-hooks';

// Material UI components
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

// components
import Controls from './controls';
import Button from './button';
import TextInput from './text-input';
import PreprintPreview from './preprint-preview';

const useStyles = makeStyles(() => ({
  input: {
    minWidth: 460,
  },
}));

export default function NewPreprint({ user, onCancel }) {
  const location = useLocation(); // location.state can be {preprint, tab, isSingleStep} with tab being `request` or `review` (so that we know on which tab the shell should be activated with
  const qs = new URLSearchParams(location.search);

  const isSingleStep = location.state && location.state.isSingleStep;

  const [{ identifier, url }, setIdentifierAndUrl] = useState({
    identifier:
      qs.get('identifier') ||
      (location.state &&
        location.state.preprint &&
        location.state.preprint.doi) ||
      (location.state &&
        location.state.preprint &&
        location.state.preprint.arXivId) ||
      '',
    url:
      (location.state &&
        location.state.preprint &&
        location.state.preprint.url) ||
      null,
  });

  const [preprint, resolvePreprintStatus] = usePreprint(
    identifier,
    location.state && location.state.preprint,
    url,
  );

  return (
    <StepPreprint
      user={user}
      onCancel={onCancel}
      onIdentifier={(identifier, url = null) => {
        setIdentifierAndUrl({ identifier, url });
      }}
      identifier={identifier}
      preprint={preprint}
      resolvePreprintStatus={resolvePreprintStatus}
    />
  );
}
NewPreprint.propTypes = {
  user: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

function StepPreprint({
  onCancel,
  onIdentifier,
  identifier,
  preprint,
  resolvePreprintStatus,
}) {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();

  const [error, setError] = useState(false);
  const [value, setValue] = useState(unprefix(identifier));

  // const hasReviewed = checkIfHasReviewed(user, actions);
  // const hasRequested = checkIfHasRequested(user, actions);

  // Note: biorXiv use versioned DOI in URL but do not register those DOIs with
  // doi.org => they 404 when we dereference them
  // => here if the doi is a versioned one, we offer the user to try with the
  // unversionned DOI
  const doiMatch = value && value.match(doiRegex());
  const doi = doiMatch && doiMatch[0];
  const unversionedDoi = unversionDoi(value);

  const url = /^\s*https?:\/\//.test(value) ? value.trim() : undefined;

  const handleChange = event => {
    const value = event.target.value;
    if (value) {
      const qs = new URLSearchParams(value);
      if (qs.get('identifier')) {
        qs.delete('identifier');
        history.replace({
          pathname: location.pathname,
          search: qs.toString(),
        });
      }
    }

    const [arxivId] = identifiersArxiv.extract(value);
    let nextIdentifier;
    if (arxivId) {
      nextIdentifier = arxivId;
    } else {
      const doiMatch = value.match(doiRegex());
      const doi = doiMatch && doiMatch[0];
      if (doi) {
        nextIdentifier = doi;
      } else {
        nextIdentifier = '';
        value === '' ? setError(false) : setError(true);
      }
    }

    if (nextIdentifier !== identifier) {
      onIdentifier(nextIdentifier, url);
    }

    setValue(value);
  };

  return (
    <Box>
      <Typography component="div" variant="body2" gutterBottom>
        Search for a preprint
      </Typography>
      <TextField
        variant="outlined"
        inputId="step-preprint-input-new"
        label="Enter preprint Digital Object Identifier (DOI) or an arXiv ID"
        autoComplete="off"
        placeholder=""
        onChange={handleChange}
        value={value}
        className={classes.input}
      />
      {preprint ? (
        <PreprintPreview preprint={preprint} />
      ) : resolvePreprintStatus.isActive ? (
        <Typography>{`resolving ${identifier}`}</Typography>
      ) : resolvePreprintStatus.error &&
        resolvePreprintStatus.error.statusCode === 404 &&
        unversionedDoi &&
        unversionedDoi !== doi ? (
        <Typography>
          Could not find an entry corresponding to <code>{doi}</code>. Try with{' '}
          <Link
            href="#"
            onClick={e => {
              e.preventDefault();
              onIdentifier(unversionedDoi, url);
              setValue(unversionedDoi);
            }}
          >
            {unversionedDoi}
          </Link>{' '}
          ?
        </Typography>
      ) : null}

      {resolvePreprintStatus.loading && (
        <Typography component="div" variant="body1">
          Checking for existing reviews or requests for reviews…
        </Typography>
      )}

      <Controls error={error || resolvePreprintStatus.error}>
        <Button
          onClick={() => {
            setValue('');
            onIdentifier('');
            onCancel();
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            history.push(`/preprints/${createPreprintId(preprint.handle)}`, {
              tab: 'request',
              isSingleStep: true,
            });
          }}
          disabled={!identifier || !preprint}
        >
          Request reviews
        </Button>
        <Button
          onClick={() => {
            history.push(`/preprints/${createPreprintId(preprint.handle)}`, {
              tab: 'reviews',
              isSingleStep: true,
            });
          }}
          disabled={!identifier || !preprint}
        >
          Add reviews
        </Button>
      </Controls>
    </Box>
  );
}
StepPreprint.propTypes = {
  user: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onIdentifier: PropTypes.func.isRequired,
  identifier: PropTypes.string,
  preprint: PropTypes.object,
  resolvePreprintStatus: PropTypes.object,
};
