import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuill } from 'react-quilljs';

import 'quill/dist/quill.snow.css'; // Add css for snow theme
// or import 'quill/dist/quill.bubble.css'; // Add css for bubble theme

const CollabEditor = ({ initialContent, handleContentChange }) => {
  const placeholder = 'Start typing...';
  const { quill, quillRef } = useQuill({ placeholder });

  useEffect(() => {
    if (quill) {
      quill.clipboard.dangerouslyPasteHTML(initialContent);
      quill.on('text-change', () => {
        handleContentChange(quillRef.current.innerHTML);
      });
    }
  }, [quill]);

  return (
    <div style={{ width: 500, height: 300 }}>
      <div ref={quillRef} />
    </div>
  );
};

CollabEditor.propTypes = {
  initialContent: PropTypes.string,
  handleContentChange: PropTypes.func.isRequired,
};

export default CollabEditor;
