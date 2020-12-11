import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// Remirror
import { RemirrorProvider, useManager, useRemirror } from 'remirror/react';
import { fromHtml } from 'remirror/core';

// Remirror extensions
import { WysiwygPreset } from 'remirror/preset/wysiwyg';
import { BoldExtension } from 'remirror/extension/bold';
// import { CollaborationExtension } from 'remirror/extension/collaboration';
import { ItalicExtension } from 'remirror/extension/italic';
import { UnderlineExtension } from 'remirror/extension/underline';
import { PlaceholderExtension } from 'remirror/extension/placeholder';
// import { YjsExtension } from 'remirror/extension/yjs';

let EXTENSIONS = [
  new PlaceholderExtension(),
  new BoldExtension(),
  new ItalicExtension(),
  new UnderlineExtension(),
  new WysiwygPreset(),
];

const Menu = () => {
  const { active, commands } = useRemirror({ autoUpdate: true });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (active) {
      setIsLoaded(true);
    }
  }, []);

  if (!isLoaded) {
    return <div>Loading toolbar...</div>;
  } else {
    return (
      <div>
        <button
          onClick={event => {
            event.preventDefault();
            commands.toggleBold();
          }}
          style={{ fontWeight: active.bold() ? 'bold' : undefined }}
        >
          B
        </button>
        <button
          onClick={event => {
            event.preventDefault();
            commands.toggleItalic();
          }}
          style={{ fontWeight: active.italic() ? 'bold' : undefined }}
        >
          I
        </button>
        <button
          onClick={event => {
            event.preventDefault();
            commands.toggleUnderline();
          }}
          style={{ fontWeight: active.underline() ? 'bold' : undefined }}
        >
          U
        </button>
      </div>
    );
  }
};

const Editor = () => {
  const { getRootProps } = useRemirror();

  return <div {...getRootProps()} />;
};

const EditorWrapper = ({ handleContentChange }) => {
  const manager = useManager(EXTENSIONS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [value, setValue] = useState(() =>
    // Use the `remirror` manager to create the state.
    manager.createState({
      content: '',
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
          // Update the state to the latest value.
          setValue(parameter.state);
          handleContentChange(parameter.getHTML());
        }}
      >
        <div>
          <Menu />
          <Editor />
        </div>
      </RemirrorProvider>
    );
  }
};

EditorWrapper.propTypes = {
  handleContentChange: PropTypes.func.isRequired,
};

export default EditorWrapper;
