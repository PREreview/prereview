import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// Remirror
import { RemirrorProvider, useManager } from 'remirror/react';
import { fromHtml } from 'remirror/core';

// Remirror extensions
import { WysiwygEditor } from '@remirror/editor-wysiwyg';
import { WysiwygPreset } from 'remirror/preset/wysiwyg';
// import { YjsExtension } from 'remirror/extension/yjs';

let EXTENSIONS = [
  // new PlaceholderExtension(),
  // new WysiwygPreset(),
];

const EditorWrapper = ({ initialContent, handleContentChange }) => {
  const manager = useManager(EXTENSIONS);
  const preset = new WysiwygPreset();
  preset.createExtensions();
  console.log(preset);
  const [isLoaded, setIsLoaded] = useState(false);
  const [value, setValue] = useState(() =>
    // Use the `remirror` manager to create the state.
    manager.createState({
      content: initialContent,
      stringHandler: fromHtml,
    }),
  );

  useEffect(() => {
    if (window) {
      // EXTENSIONS.push(new YjsExtension(), new CollaborationExtension());

      setIsLoaded(true);
    }
  }, []);

  if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <RemirrorProvider
        placeholder={'Start typing...'}
        manager={manager}
        value={value}
        onChange={parameter => {
          console.log(parameter.state);
          // Update the state to the latest value.
          setValue(parameter.state);
          handleContentChange(parameter.getHTML());
        }}
      >
        <div>
          <WysiwygEditor />
        </div>
      </RemirrorProvider>
    );
  }
};

EditorWrapper.propTypes = {
  initialContent: PropTypes.string.isRequired,
  handleContentChange: PropTypes.func.isRequired,
};

export default EditorWrapper;
