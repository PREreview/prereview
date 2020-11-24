import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MdPerson } from 'react-icons/md';
import { Menu, MenuList, MenuButton, MenuLink } from '@reach/menu-button';
import classNames from 'classnames';
import Tooltip from '@reach/tooltip';
import { unprefix, getId } from '../utils/jsonld';
import { GetUser } from '../hooks/api-hooks.tsx';
import NoticeBadge from './notice-badge';

const RoleBadge = React.forwardRef(function RoleBadge(
  { roleId, children, className, tooltip, showNotice, disabled },
  ref,
) {
  const user = GetUser(roleId);

  return (
    <RoleBadgeUI
      ref={ref}
      tooltip={tooltip}
      roleId={roleId}
      user={user}
      loading={user.loading}
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
  roleId: PropTypes.string.isRequired,
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
  {
    roleId,
    user,
    loading,
    className,
    children,
    tooltip,
    showNotice = false,
    disabled = false,
  },
  ref,
) {
  if (roleId == null && loading == null && !!user) {
    roleId = getId(user);
  }

  return (
    <Menu>
      <div className="role-badge-menu-container">
        {showNotice && <NoticeBadge />}
        <MenuButton
          className={classNames('role-badge-menu', className, {
            'role-badge-menu--loading': loading,
          })}
          disabled={disabled}
        >
          {/*NOTE: the `ref` is typically used for Drag and Drop: we need 1 DOM element that will be used as the drag preview */}
          <Tooltipify tooltip={tooltip} user={user} roleId={roleId}>
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
                    !!user && user.avatar && user.avatar.contentUrl && !loading,
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
                  ? `about/${unprefix(roleId)}`
                  : undefined
              }
              target={process.env.IS_EXTENSION ? '_blank' : undefined}
              to={
                process.env.IS_EXTENSION
                  ? undefined
                  : `/about/${unprefix(roleId)}`
              }
            >
              {user && user.name && user.name !== unprefix(roleId)
                ? `${user.name} (${unprefix(roleId).substring(0, 5)}…)`
                : `View Profile (${unprefix(roleId).substring(0, 5)}…)`}
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
                  ? `about/${unprefix(roleId)}`
                  : undefined
              }
              target={process.env.IS_EXTENSION ? '_blank' : undefined}
              to={
                process.env.IS_EXTENSION
                  ? undefined
                  : `/about/${unprefix(roleId)}`
              }
            >
              {user && user.name && user.name !== unprefix(roleId)
                ? `${user.name} (${unprefix(roleId).substring(0, 5)}…)`
                : `View Profile (${unprefix(roleId).substring(0, 5)}…)`}
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
  roleId: PropTypes.string,
  user: PropTypes.shape({
    '@id': PropTypes.string.isRequired,
    '@type': PropTypes.oneOf(['PublicReviewerRole', 'AnonymousReviewerRole'])
      .isRequired,
    name: PropTypes.string,
    avatar: PropTypes.shape({
      '@type': PropTypes.oneOf(['ImageObject']).isRequired,
      encodingFormat: PropTypes.oneOf(['image/jpeg', 'image/png']).isRequired,
      contentUrl: PropTypes.string.isRequired,
    }),
  }),
  loading: PropTypes.bool,
  children: PropTypes.any,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export { RoleBadgeUI };

function Tooltipify({ tooltip, roleId, user, children }) {
  return tooltip ? (
    <Tooltip
      label={
        user && user.name && user.name !== unprefix(roleId)
          ? `${user.name} (${unprefix(roleId).substring(0, 5)}…)`
          : unprefix(roleId)
      }
    >
      <div>{children}</div>
    </Tooltip>
  ) : (
    children
  );
}

Tooltipify.propTypes = {
  tooltip: PropTypes.bool,
  roleId: PropTypes.string,
  user: PropTypes.shape({
    name: PropTypes.string,
  }),
  children: PropTypes.any,
};
