import React from 'react';
import { BoldExtension } from 'remirror/extension/bold';
import { RemirrorProvider, useManager, useRemirror } from 'remirror/react';

const Button = () => {
  // `autoUpdate` means that every editor update will recalculate the output
  // from `active.bold()` and keep the bold status up to date in the editor.
  const { active, commands } = useRemirror({ autoUpdate: true });

  return (
    <>
      <button
        onClick={() => commands.toggleBold()}
        style={{ fontWeight: active.bold() ? 'bold' : undefined }}
      >
        Bold
      </button>
    </>
  );
};

const Editor = () => {
  // The `getRootProps` adds the ref to the div element below to inject the
  // ProseMirror dom. You have full control over where it should be placed.
  // The first call is the one that is used.
  const { getRootProps } = useRemirror();

  return <div {...getRootProps()} />;
};

export const EditorWrapper = () => {
  const manager = useManager(() => [new BoldExtension()]);

  // The editor is built up like lego blocks of functionality within the editor
  // provider.
  return (
    <RemirrorProvider manager={manager}>
      <Editor />
      <Button />
    </RemirrorProvider>
  );
};
