import React, { useEffect, useState } from 'react';
import { BoldExtension } from 'remirror/extension/bold';
import { CollaborationExtension } from 'remirror/extension/collaboration';
import { ItalicExtension } from 'remirror/extension/italic';
import { YjsExtension } from 'remirror/extension/yjs';
import { RemirrorProvider, useManager, useRemirror } from 'remirror/react';

let extensions = [];

/**
 * This component contains the editor and any toolbars/chrome it requires.
 */
const SmallEditor = () => {
  const { getRootProps, commands } = useRemirror();

  return (
    <div>
      <button onClick={() => commands.toggleBold()}>bold</button>
      <button onClick={() => commands.toggleItalic()}>italic</button>
      <div {...getRootProps()} />
    </div>
  );
};

const SmallEditorContainer = () => {
  let extensionManager = useManager(extensions);

  const { value, onChange } = extensionManager;

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (window !== undefined) {
      extensions.push(
        new BoldExtension(),
        new CollaborationExtension(),
        new ItalicExtension(),
        new YjsExtension(),
      );
      setIsLoaded(true);
    }
  }, []);

  if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <RemirrorProvider
        manager={extensionManager}
        value={value}
        onChange={onChange}
      >
        <SmallEditor />
      </RemirrorProvider>
    );
  }
};

export default SmallEditorContainer;
