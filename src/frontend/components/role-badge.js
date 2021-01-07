import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MdPerson } from 'react-icons/md';
import { Menu, MenuList, MenuButton, MenuLink } from '@reach/menu-button';
import classNames from 'classnames';
import Tooltip from '@reach/tooltip';
import NoticeBadge from './notice-badge';

const RoleBadge = React.forwardRef(function RoleBadge(
  { children, className, tooltip, showNotice, disabled, user },
  ref,
) {
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
  console.log('***user***:', user);
  return (
    <Menu>
      <div className="role-badge-menu-container">
        {showNotice && <NoticeBadge />}
        <MenuButton
          className={classNames('role-badge-menu', className)}
          disabled={disabled}
        >
          {/*NOTE: the `ref` is typically used for Drag and Drop: we need 1 DOM element that will be used as the drag preview */}
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
        </MenuButton>

        {/* Note: MenuList is currently bugged if children is undefined hence the ternary */}
        {children ? (
          <MenuList
            className="menu__list"
            style={{ display: disabled ? 'none' : 'block' }}
          >
            <MenuLink
              as={process.env.IS_EXTENSION ? undefined : Link}
              className="menu__list__link-item"
              href={
                process.env.IS_EXTENSION
                  ? `about/${
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
              {user && user.orcid
                ? `View Profile ${user.defaultPersona.name} (${user.orcid})`
                : `View Profile ${user.name} (${user.identity.orcid})`}
            </MenuLink>
            {children}
          </MenuList>
        ) : (
          <MenuList className="menu__list">
            <MenuLink
              as={process.env.IS_EXTENSION ? undefined : Link}
              className="menu__list__link-item"
              href={
                process.env.IS_EXTENSION
                  ? `about/${
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
              {user && user.orcid
                ? `View Profile ${user.defaultPersona.name} (${user.orcid})`
                : `View Profile ${user.name} (${user.identity.orcid})`}
            </MenuLink>
          </MenuList>
        )}
      </div>
    </Menu>
  );
});

RoleBadgeUI.propTypes = {
  showNotice: PropTypes.bool,
  tooltip: PropTypes.bool,
  user: PropTypes.shape({
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
