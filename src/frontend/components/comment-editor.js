import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuill } from 'react-quilljs';

import 'quill/dist/quill.snow.css'; // Add css for snow theme
// or import 'quill/dist/quill.bubble.css'; // Add css for bubble theme

const CommentEditor = ({ initialContent, handleContentChange }) => {
  const placeholder = 'Start typing...';
  const theme = 'snow';

  const { quill, quillRef } = useQuill({ theme, placeholder });

  useEffect(() => {
    if (quill) {
      quill.clipboard.dangerouslyPasteHTML(initialContent);
      quill.on('text-change', () => {
        handleContentChange(quillRef.current.innerHTML);
      });
    }
  }, [quill]);

  return (
    <div style={{ width: '100%' }}>
      <div ref={quillRef} />
    </div>
  );
};

CommentEditor.propTypes = {
  initialContent: PropTypes.string,
  handleContentChange: PropTypes.func.isRequired,
};

export default CommentEditor;
