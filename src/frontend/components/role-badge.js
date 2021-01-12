// base imports
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Tooltip from '@reach/tooltip';
import ExpandToggle from '@threespot/expand-toggle';

// components
import NoticeBadge from './notice-badge';
import XLink from './xlink';

// icons
import { MdPerson } from 'react-icons/md';

const RoleBadge = React.forwardRef(function RoleBadge(
  { children, className, tooltip, showNotice, disabled, user },
  ref,
) {
  useEffect(() => {
    const toggles = document.querySelectorAll('[data-expands]');

    toggles.forEach(el => new ExpandToggle(el));
  }, []);

  return (
    <RoleBadgeUI
      ref={ref}
      tooltip={tooltip}
      user={user}
      className={className}
      showNotice={showNotice}
      disabled={disabled}
    >
      {children}
    </RoleBadgeUI>
  );
});

RoleBadge.propTypes = {
  tooltip: PropTypes.bool,
  user: PropTypes.object.isRequired,
  children: PropTypes.any,
  className: PropTypes.string,
  showNotice: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default RoleBadge;

/**
 * Non hooked version (handy for story book and `UserBadge`)
 */
const RoleBadgeUI = React.forwardRef(function RoleBadgeUI(
  { user, className, children, tooltip, showNotice = false, disabled = false },
  ref,
) {
  return (
    <>
      <div className="role-badge-menu-container">
        {showNotice && <NoticeBadge />}
        <button
          type="button"
          data-expands={user.id}
          data-expands-class="is-expanded"
          data-expands-height
          className={classNames('role-badge-menu', className)}
          disabled={disabled}
        >
          <span data-expands-text="Close" className="vh">
            Open
          </span>
          <Tooltipify tooltip={tooltip} user={user}>
            <div ref={ref}>
              <div
                className={classNames(
                  'role-badge-menu__generic-icon-container',
                )}
              >
                <MdPerson className="role-badge-menu__generic-icon" />
              </div>

              <div
                className={classNames('role-badge-menu__avatar', {
                  'role-badge-menu__avatar--loaded':
                    user && user.avatar && user.avatar.contentUrl,
                })}
                style={
                  user && user.avatar && user.avatar.contentUrl
                    ? {
                        backgroundImage: `url(${user.avatar.contentUrl})`,
                        backgroundSize: 'contain',
                      }
                    : undefined
                }
              />
            </div>
          </Tooltipify>
        </button>
      </div>
      <div className="menu__list expandable" id={user.id}>
        <XLink
          className="menu__list__link-item"
          href={
            process.env.IS_EXTENSION
              ? `/about/${
                  user.orcid
                    ? user.orcid
                    : user.identity
                    ? user.identity.orcid
                    : user.id
                }`
              : undefined
          }
          target={process.env.IS_EXTENSION ? '_blank' : undefined}
          to={
            process.env.IS_EXTENSION
              ? undefined
              : `/about/${
                  user.orcid
                    ? user.orcid
                    : user.identity
                    ? user.identity.orcid
                    : user.id
                }`
          }
        >
          {user && user.defaultPersona
            ? `View Profile ${user.defaultPersona.name}`
            : `View Profile ${user.name}`}
        </XLink>
        {children}
      </div>
    </>
  );
});

RoleBadgeUI.propTypes = {
  showNotice: PropTypes.bool,
  tooltip: PropTypes.bool,
  user: PropTypes.shape({
    defaultPersona: PropTypes.object,
    id: PropTypes.number,
    identity: PropTypes.number,
    orcid: PropTypes.string,
    name: PropTypes.string,
    avatar: PropTypes.object,
  }),
  children: PropTypes.any,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export { RoleBadgeUI };

function Tooltipify({ tooltip, user, children }) {
  return tooltip ? (
    <Tooltip label={`${user.name}`}>
      <div>{children}</div>
    </Tooltip>
  ) : (
    children
  );
}

Tooltipify.propTypes = {
  tooltip: PropTypes.bool,
  user: PropTypes.shape({
    name: PropTypes.string,
    identity: PropTypes.number.required,
  }),
  children: PropTypes.any,
};
