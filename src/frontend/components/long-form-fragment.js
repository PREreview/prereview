import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

// components
import CollabEditor from './collab-editor';

export default function LongFormFragment({
  content,
  onContentChange,
  template,
  hasTemplate,
}) {
  return (
    <div className="rapid-form-fragment">
      <fieldset className="rapid-form-fragment__text-response-questions">
        <Fragment key={'longform'}>
          <CollabEditor
            initialContent={content}
            handleContentChange={onContentChange}
            template={template}
            hasTemplate={hasTemplate}
          />
        </Fragment>
      </fieldset>
    </div>
  );
}

LongFormFragment.propTypes = {
  content: PropTypes.string.isRequired,
  onContentChange: PropTypes.func.isRequired,
  template: PropTypes.string,
  hasTemplate: PropTypes.bool,
};
