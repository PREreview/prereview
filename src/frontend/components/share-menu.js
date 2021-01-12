// base imports
import React, { Fragment, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import copy from 'clipboard-copy';
import ExpandToggle from '@threespot/expand-toggle';
import VisuallyHidden from '@reach/visually-hidden';

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

export default function ShareMenu({ identifier, roleIds = [] }) {
  const [permalink, setPermalink] = useState(null);

  useEffect(() => {
    const toggle = document.getElementById('expand-preprint');

    new ExpandToggle(toggle);
  }, []);

  return (
    <Fragment>
      <div className="share-menu-container">
        <button
          className="share-menu"
          data-expands="preprint"
          data-expands-class="is-expanded"
          data-expands-height
          id="expand-preprint"
        >
          <VisuallyHidden>Share</VisuallyHidden>
          <MdShare className="share-menu__icon" />
        </button>
        <div className="menu__list expandable" id="preprint">
          <XLink
            className="menu__list__link-item"
            download="rapid-prereview-data.jsonld"
            href={`/api/v2/preprint/${unprefix(createPreprintId(identifier))}`}
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
            href={`/api/v2/preprint/${unprefix(createPreprintId(identifier))}`}
          >
            Download data (JSON-LD)
          </XLink>
        </div>
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
        href={`${url.pathname}${url.search}${url.hash}`}
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
