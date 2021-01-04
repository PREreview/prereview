import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

// components
import CollabEditor from './collab-editor';

export default function LongFormFragment({ content, onContentChange }) {
  const handleContentChange = value => {
    onContentChange(value);
  };

  return (
    <div className="rapid-form-fragment">
      <fieldset className="rapid-form-fragment__text-response-questions">
        <Fragment key={'longform'}>
          <div className="remirror-container">
            <CollabEditor
              initialContent={content}
              handleContentChange={handleContentChange}
            />
          </div>
        </Fragment>
      </fieldset>
    </div>
  );
}

LongFormFragment.propTypes = {
  content: PropTypes.string.isRequired,
  onContentChange: PropTypes.func.isRequired,
  answerMap: PropTypes.object,
};
