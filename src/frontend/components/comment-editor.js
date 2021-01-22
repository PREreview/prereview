import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuill } from 'react-quilljs';

import 'quill/dist/quill.snow.css'; // Add css for snow theme
// or import 'quill/dist/quill.bubble.css'; // Add css for bubble theme

const CommentEditor = ({ initialContent, handleContentChange }) => {
  const placeholder = 'Comment section (maximum 150 words)';
  const theme = 'snow';

  const { quill, quillRef } = useQuill({
    theme,
    placeholder,
    modules: {
      toolbar: '#comments-toolbar',
    },
    formats: ['bold', 'italic', 'underline', 'strike'],
  });

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
      <div id="comments-toolbar">
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-underline" />
        <button className="ql-strike" />
      </div>
      <div ref={quillRef} />
      <div id="comments-editor" />
    </div>
  );
};

CommentEditor.propTypes = {
  initialContent: PropTypes.string,
  handleContentChange: PropTypes.func.isRequired,
};

export default CommentEditor;
