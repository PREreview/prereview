// base imports
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

// yjs imports
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

// react quill js imports
import { QuillBinding } from 'y-quill';
import QuillCursors from 'quill-cursors';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css'; // Add css for snow theme
// or import 'quill/dist/quill.bubble.css'; // Add css for bubble theme

const ydoc = new Y.Doc();
const provider = new WebrtcProvider('prereview-collab', ydoc);

const CollabEditor = ({ initialContent, handleContentChange }) => {
  /* collaboration needs */
  // provider.connect();

  // quill options
  const placeholder = 'Start typing...';
  const modules = {
    cursors: true,
    history: {
      userOnly: true,
    },
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['link', 'image', 'video'],
      [{ color: [] }, { background: [] }],

      ['clean'],
    ],
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

  const { quill, quillRef, Quill } = useQuill({
    placeholder,
    modules,
    formats,
  });

  // To execute this line only once
  if (Quill && !quill) {
    Quill.register('modules/cursors', QuillCursors);
  }

  if (quill) {
    // provider.connect();
  }

  useEffect(() => {
    if (quill) {
      let delta;
      // create yjs binding for web socket collaboration
      const type = ydoc.getText('quill');

      const binding = new QuillBinding(type, quill, provider.awareness);

      // paste initial value into editor
      quill.clipboard.dangerouslyPasteHTML(initialContent);
      delta = quill.clipboard.convert(initialContent);
      quill.setContents(delta);

      quill.on('text-change', () => {
        handleContentChange(
          quillRef.current ? quillRef.current.innerHTML : initialContent,
        );
      });
    }
  }, [quill, quillRef]);

  return (
    <div>
      <div id="toolbar" />
      <div ref={quillRef} />
      <div id="editor" />
    </div>
  );
};

CollabEditor.propTypes = {
  initialContent: PropTypes.string,
  handleContentChange: PropTypes.func.isRequired,
};

export default CollabEditor;
