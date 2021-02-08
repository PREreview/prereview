import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MdMenu } from 'react-icons/md';
import PreReviewLogo from './pre-review-logo';
import IconButton from './icon-button';
import UserBadge from './user-badge';
import XLink from './xlink';
import NoticeBadge from './notice-badge';
import { useIsMobile } from '../hooks/ui-hooks';

export default function HeaderBar({ onClickMenuButton, closeGap, thisUser }) {
  const roles = thisUser && thisUser.groups ? thisUser.groups : []; //GetUser(1);

  //const showProfileNotice = checkIfRoleLacksMininmalData(role);
  const showProfileNotice = false;
  const isMobile = useIsMobile();

  const [initialHeaderOffset, setinitialHeaderOffset] = useState(null);
  const [initialHeaderOffsetMobile, setinitialHeaderOffsetMobile] = useState(
    null,
  );

  closeGap = true;
  useEffect(() => {
    if (document) {
      document.documentElement.style.setProperty(
        '--announcement-bar-height',
        closeGap ? '0px' : initialHeaderOffset,
      );

      document.documentElement.style.setProperty(
        '--announcement-bar-height--mobile',
        closeGap ? '0px' : initialHeaderOffsetMobile,
      );
      setHeaderOffset();
    }
  }, []);

  const setHeaderOffset = () => {
    const headerBarOffset = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue('--announcement-bar-height');

    const headerBarOffsetMobile = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue('--announcement-bar-height--mobile');

    setinitialHeaderOffset(headerBarOffset);
    setinitialHeaderOffsetMobile(headerBarOffsetMobile);
  };

  return (
    <div className="header-bar">
      <div className="header-bar__left">
        {!!onClickMenuButton && (
          <IconButton
            data-noclickoutside="true"
            onClickCapture={onClickMenuButton}
            className="header-bar__menu-button"
          >
            <MdMenu
              className="header-bar__menu-button-icon"
              data-noclickoutside="true"
            />
          </IconButton>
        )}
        <PreReviewLogo />
      </div>

      <div className="header-bar__right">
        <a
          className="header-bar__nav-item"
          href="https://content.prereview.org/about"
        >
          About
        </a>
        <a
          className="header-bar__nav-item"
          href="https://content.prereview.org/people"
        >
          People
        </a>
        <a
          className="header-bar__nav-item"
          href="https://content.prereview.org/programs"
        >
          Programs
        </a>
        <a className="header-bar__nav-item" href="/communities">
          Communities
        </a>
        <a
          className="header-bar__nav-item"
          href="https://content.prereview.org/resources"
        >
          Resources
        </a>
        <a
          className="header-bar__nav-item"
          href="https://content.prereview.org/coc"
        >
          {isMobile ? (
            <abbr title="Code of Conduct">CoC</abbr>
          ) : (
            <span>Code of Conduct</span>
          )}
        </a>
        <a
          className="header-bar__nav-item"
          href="https://content.prereview.org"
        >
          Blog
        </a>
        <a className="header-bar__nav-item" href="/api/docs">
          API
        </a>
        <span className="header-bar__nav-item header-bar__nav-item--user-badge">
          {thisUser ? (
            <UserBadge user={thisUser} showNotice={showProfileNotice}>
              {showProfileNotice && (
                <XLink
                  to={process.env.IS_EXTENSION ? undefined : '/settings'}
                  href={`/settings`}
                  target={process.env.IS_EXTENSION ? '_blank' : undefined}
                >
                  Complete Profile
                  <div className="menu__link-item__icon">
                    <NoticeBadge />
                  </div>
                </XLink>
              )}

              <XLink
                to={process.env.IS_EXTENSION ? undefined : '/settings'}
                href={`/settings`}
                target={process.env.IS_EXTENSION ? '_blank' : undefined}
              >
                User Settings
              </XLink>

              {thisUser.isAdmin && (
                <XLink
                  to={process.env.IS_EXTENSION ? undefined : '/admin'}
                  href={`/admin`}
                  target={process.env.IS_EXTENSION ? '_blank' : undefined}
                >
                  Admin Settings
                </XLink>
              )}

              {thisUser.isAdmin && (
                <XLink
                  to={process.env.IS_EXTENSION ? undefined : '/block'}
                  href={`/block`}
                  target={process.env.IS_EXTENSION ? '_blank' : undefined}
                >
                  Moderate Users
                </XLink>
              )}

              {roles.includes('moderators') && !thisUser.isModerated && (
                <XLink
                  to={process.env.IS_EXTENSION ? undefined : '/moderate'}
                  href={`/moderate`}
                  target={process.env.IS_EXTENSION ? '_blank' : undefined}
                >
                  Moderate Reviews
                </XLink>
              )}
              <XLink to="/logout" href={`/logout`}>
                Logout
              </XLink>
            </UserBadge>
          ) : (
            <XLink to="/login" href="/login">
              Log In / Sign Up
            </XLink>
          )}
        </span>
      </div>
      {/* TODO link to feedback form */}
      <div className="header-bar__give-feedback">
        <a
          href="https://forms.gle/BjHvfBWXYVchUwvs9"
          target="_blank"
          rel="noopener noreferrer"
        >
          Give Feedback
        </a>
      </div>
    </div>
  );
}

HeaderBar.propTypes = {
  onClickMenuButton: PropTypes.func,
  closeGap: PropTypes.bool,
  thisUser: PropTypes.object,
};
