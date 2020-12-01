import React from 'react';
import PropTypes from 'prop-types';
import { MdChevronRight } from 'react-icons/md';
import Value from './value';
import { getFormattedDatePosted } from '../utils/preprints';
import { createPreprintId } from '../../common/utils/ids.js';
import XLink from './xlink';
import ShellIcon from '../svgs/shell_icon.svg';

export default function PreprintPreview({ preprint }) {
  console.log(createPreprintId(preprint.handle));

  return (
    <div className="preprint-preview">
      <div className="preprint-preview__header">
        {preprint.title ? (
          <XLink
            href={`/${createPreprintId(preprint.handle)}`}
            to={{
              pathname: `/${createPreprintId(preprint.handle)}`,
            }}
            className="preprint-preview__hyperlink"
          >
            <Value className="preprint-preview__title" tagName="h2">
              {preprint.title}
            </Value>
            <img
              src={ShellIcon}
              className="preprint-preview__shell-icon"
              aria-hidden="true"
              alt=""
            />
          </XLink>
        ) : (
          <Value className="preprint-preview__title" tagName="h2">
            {preprint.title}
          </Value>
        )}

        {!!preprint.datePosted && (
          <span className="preprint-preview__date">
            {getFormattedDatePosted(preprint.datePosted)}
          </span>
        )}
      </div>

      <div className="preprint-preview__info">
        {preprint.preprintServer && (
          <Value className="preprint-preview__server" tagName="span">
            {preprint.preprintServer}
          </Value>
        )}
        <MdChevronRight className="preprint-preview__server-arrow-icon" />
        {preprint.handle && (
          <span className="preprint-preview__id">
            {preprint.handle ? (
              <a
                href={`https://doi.org/${preprint.handle}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {preprint.handle}
              </a>
            ) : (
              <a
                href={`https://arxiv.org/abs/${preprint.arXivId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {preprint.arXivId}
              </a>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
PreprintPreview.propTypes = {
  preprint: PropTypes.object.isRequired,
};
