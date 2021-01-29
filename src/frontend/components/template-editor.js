// base imports
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css'; // Add css for snow theme
// or import 'quill/dist/quill.bubble.css'; // Add css for bubble theme

const TemplateEditor = ({ initialContent, handleContentChange, id }) => {
  /* collaboration needs */
  // provider.connect();

  // quill options
  const placeholder = 'Start typing...';
  const theme = 'snow';
  const modules = {
    toolbar: `#template-toolbar-${id}`,
  };
  const formats = [
    'bold',
    'italic',
    'underline',
    'strike',
    'align',
    'list',
    'indent',
    'header',
    'link',
    'image',
    'video',
    'color',
    'background',
    'clean',
  ];

  const { quill, quillRef } = useQuill({
    formats,
    modules,
    placeholder,
    theme,
  });

  useEffect(() => {
    if (quill) {
      quill.on('text-change', () => {
        handleContentChange(quillRef.current.innerHTML);
      });
    }
  }, [quill, quillRef, initialContent]);

  return (
    <div>
      <div id={`template-toolbar-${id}`}>
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-underline" />
        <button className="ql-strike" />
        <button className="ql-align" />
        <button className="ql-list" value="ordered" />
        <button className="ql-list" value="bullet" />
        <button className="ql-indent" value="-1" />
        <button className="ql-indent" value="+1" />
        <select className="ql-header">
          <option value="1" />
          <option value="2" />
          <option value="3" />
          <option value="4" />
          <option value="5" />
          <option value="6" />
          <option />
        </select>
        <button className="ql-link" />
        <button className="ql-image" />
        <button className="ql-video" />
        <button className="ql-color" />
        <button className="ql-background" />
        <button className="ql-clean" />
      </div>
      <div ref={quillRef} />
      <div id={`template-editor-${id}`} />
    </div>
  );
};

TemplateEditor.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  initialContent: PropTypes.string,
  handleContentChange: PropTypes.func.isRequired,
};

export default TemplateEditor;
