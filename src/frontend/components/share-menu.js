// base imports
import React, { Fragment, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import copy from 'clipboard-copy';
import VisuallyHidden from '@reach/visually-hidden';

// material UI
import { makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';

// utils
import { createPreprintId } from '../utils/ids';
import { unprefix } from '../utils/jsonld';

// components
import Button from './button';
import Controls from './controls';
import Modal from './modal';
import XLink from './xlink';

// icons
import { MdShare } from 'react-icons/md';

const useStyles = makeStyles(theme => ({
  popoverInner: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
  },
}));

export default function ShareMenu({ identifier, roleIds = [] }) {
  const classes = useStyles();

  const [permalink, setPermalink] = useState(null);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'share-menu' : undefined;

  return (
    <Fragment>
      <div className="share-menu-container">
        <button
          className="share-menu"
          type="button"
          aria-describedby={id}
          variant="contained"
          color="primary"
          onClick={handleClick}
        >
          <VisuallyHidden>Share</VisuallyHidden>
          <MdShare className="share-menu__icon" />
        </button>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          className={classes.popover}
        >
          <div className={classes.popoverInner}>
            <XLink
              className="menu__list__link-item"
              download="rapid-prereview-data.jsonld"
              href={`/api/v2/preprint/${unprefix(
                createPreprintId(identifier),
              )}`}
              to={`/api/v2/preprint/${unprefix(createPreprintId(identifier))}`}
            >
              Permalink
            </XLink>

            {!!(roleIds && roleIds.length) && (
              <div
                className="menu__list"
                onSelect={() => {
                  const qs = new URLSearchParams();
                  qs.set('role', roleIds.map(unprefix));

                  setPermalink(`${identifier}?${qs.toString()}`);
                }}
              >
                Permalink (for selected user{roleIds.length > 1 ? 's' : ''})
              </div>
            )}

            <XLink
              className="menu__list__link-item"
              download="rapid-prereview-data.jsonld"
              href={`/api/v2/preprint/${unprefix(
                createPreprintId(identifier),
              )}`}
              to={`/api/v2/preprint/${unprefix(createPreprintId(identifier))}`}
            >
              Download data (JSON-LD)
            </XLink>
          </div>
        </Popover>
      </div>

      {!!permalink && (
        <PermalinkModal
          permalink={permalink}
          onClose={() => {
            setPermalink(null);
          }}
        />
      )}
    </Fragment>
  );
}

ShareMenu.propTypes = {
  identifier: PropTypes.string.isRequired,
  roleIds: PropTypes.arrayOf(PropTypes.number),
};

function PermalinkModal({ permalink, onClose }) {
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [status, setStatus] = useState({
    isActive: false,
    success: false,
    error: null,
  });

  useEffect(() => {
    if (status.isActive) {
      copy(permalink)
        .then(() => {
          if (isMountedRef.current) {
            setStatus({ isActive: false, success: true, error: null });
          }
        })
        .catch(err => {
          if (isMountedRef.current) {
            setStatus({ isActive: false, success: false, error: err });
          }
        });
    } else if (status.success) {
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          setStatus({ isActive: false, success: false, error: null });
        }
      }, 1000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [status, permalink]);

  const url = new URL(permalink);
  return (
    <Modal
      title="Get permalink"
      showCloseButton={true}
      onClose={onClose}
      className="permalink-modal"
    >
      <XLink
        href={`/${url.pathname}${url.search}${url.hash}`}
        to={{
          pathname: url.pathname,
          search: url.search,
          hash: url.hash,
        }}
      >
        {permalink}
      </XLink>

      <Controls error={status.error}>
        <Button
          disabled={status.isActive || status.success}
          onClick={e => {
            setStatus({
              isActive: true,
              success: false,
              error: null,
            });
          }}
        >
          {status.isActive
            ? 'Copying'
            : status.success
            ? 'Copied!'
            : ' Copy to clipboard'}
        </Button>
      </Controls>
    </Modal>
  );
}

PermalinkModal.propTypes = {
  permalink: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
