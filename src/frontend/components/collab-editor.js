import React, { useEffect, useState } from 'react';

// Remirror
import { AllStyledComponent } from '@remirror/styles/emotion';
import { RemirrorProvider, useManager, useRemirror } from 'remirror/react';
import { fromHtml } from 'remirror/core';

// Remirror extensions
import { CollaborationExtension } from 'remirror/extension/collaboration';
import { YjsExtension } from 'remirror/extension/yjs';

// Remirror presets
import { CorePreset } from 'remirror/preset/core';
import { WysiwygPreset } from 'remirror/preset/wysiwyg';


let EXTENSIONS = [new CorePreset({ rootContent: 'block*' }), new WysiwygPreset()];

const Menu = () => {
  const { commands, active } = useRemirror({ autoUpdate: true });
  const [isLoaded, setIsLoaded] = useState(false);
  console.log('active: ', active);
  console.log('commands: ', commands);

  useEffect(() => {
    if (active.bold) {
      setIsLoaded(true);
    }
  }, []);

  if (!isLoaded) {
    return <div>Loading toolbar...</div>;
  } else {
    return (
      <div>
        <div>
          <button
            onClick={() => commands.toggleHeading()}
            style={{ fontWeight: active.heading() ? 'bold' : undefined }}
          >
            Heading
          </button>
          <button
            onClick={() => commands.toggleBold()}
            style={{ fontWeight: active.bold() ? 'bold' : undefined }}
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => commands.toggleItalic()}
            style={{ fontWeight: active.italic() ? 'bold' : undefined }}
          >
            <em>I</em>
          </button>
          <button
            onClick={() => commands.toggleUnderline()}
            style={{ fontWeight: active.underline() ? 'bold' : undefined }}
          >
            <u>U</u>
          </button>
          <button
            onClick={() => commands.toggleBlockquote()}
            style={{ fontWeight: active.blockquote() ? 'bold' : undefined }}
          >
            <i className="fa fa-quote-right fa-fw" aria-hidden="true" />
            <span className="vh">Blockquote</span>
          </button>
        </div>
      </div>
    );
  }
};

const Editor = () => {
  const { getRootProps } = useRemirror();

  return <div {...getRootProps()} />;
};

const EditorWrapper = () => {
  const manager = useManager(EXTENSIONS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [value, setValue] = useState(() =>
    // Use the `remirror` manager to create the state.
    manager.createState({
      content: '<p>This is the initial value</p>',
      stringHandler: fromHtml,
    }),
  );

  useEffect(() => {
    console.log(EXTENSIONS);
    if (window) {
      EXTENSIONS.push(new YjsExtension(), new CollaborationExtension());

      setIsLoaded(true);
    }
  }, []);

  if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <AllStyledComponent>
        <RemirrorProvider
          manager={manager}
          value={value}
          onChange={parameter => {
            // Update the state to the latest value.
            setValue(parameter.state);
          }}
        >
          <div>
            <Menu />
            <Editor />
          </div>
        </RemirrorProvider>
      </AllStyledComponent>
    );
  }
};

export default EditorWrapper;
