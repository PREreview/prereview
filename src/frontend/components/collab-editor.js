import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// Remirror
import { useManager } from 'remirror/react';
import { fromHtml } from 'remirror/core';

// Remirror extensions
// import { WysiwygEditor } from '@remirror/editor-wysiwyg';
import {
  WysiwygEditor,
  WysiwygProvider,
} from '@remirror/react-wysiwyg';
import { WysiwygPreset } from 'remirror/preset/wysiwyg';
// import { YjsExtension } from 'remirror/extension/yjs';

let EXTENSIONS = [];

const EditorWrapper = ({ initialContent, handleContentChange }) => {
  const manager = useManager();
  const [value, setValue] = useState(() =>
    manager.createState({
      content: initialContent,
      stringHandler: fromHtml,
    }),
  );
  // const initialValue = manager.createState({
  //   content: initialContent,
  //   stringHandler: fromHtml,
  // });
  //
  // console.log(manager.getState());

  const onChange = useCallback(parameter => {
    setValue(parameter.state);
    handleContentChange(parameter.getHTML());
  }, []);

  useEffect(() => {
    console.log(WysiwygProvider);
  }, [value]);

  return (
    <WysiwygProvider
      // manager={manager}
      stringHandler={fromHtml}
      // content={value}
      // value={value}
      onChange={onChange}
    >
      <WysiwygEditor content={value} />
    </WysiwygProvider>
  );
};

EditorWrapper.propTypes = {
  initialContent: PropTypes.string.isRequired,
  handleContentChange: PropTypes.func.isRequired,
};

export default EditorWrapper;
