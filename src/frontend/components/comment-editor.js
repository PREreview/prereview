import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuill } from 'react-quilljs';

import 'quill/dist/quill.snow.css'; // Add css for snow theme
// or import 'quill/dist/quill.bubble.css'; // Add css for bubble theme

const CommentEditor = ({ handleContentChange, reviewId }) => {
  const placeholder = 'Comment section (maximum 150 words)';
  const theme = 'snow';

  const { quill, quillRef } = useQuill({
    theme,
    placeholder,
    modules: {
      toolbar: `#comments-toolbar-${reviewId}`,
    },
    formats: ['bold', 'italic', 'underline', 'strike'],
  });

  useEffect(() => {
    if (quill) {
      quill.on('text-change', () => {
        handleContentChange(quillRef.current.innerHTML);
      });
    }
  }, [quill, quillRef]);

  return (
    <div style={{ width: '100%' }}>
      <div id={`comments-toolbar-${reviewId}`}>
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-underline" />
        <button className="ql-strike" />
      </div>
      <div ref={quillRef} />
      <div id={`comments-editor-${reviewId}`} />
    </div>
  );
};

CommentEditor.propTypes = {
  handleContentChange: PropTypes.func.isRequired,
  reviewId: PropTypes.number.isRequired,
};

export default CommentEditor;
