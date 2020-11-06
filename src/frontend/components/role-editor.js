import React, { useCallback, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import AvatarEditor from 'react-avatar-editor';
import { useDropzone } from 'react-dropzone';
import { MdPerson } from 'react-icons/md';
import Button from './button';
import Controls from './controls';
import TextInput from './text-input';
import { UpdateUser } from '../hooks/api-hooks.tsx';

export default function RoleEditor({ editor, user, onCancel, onSaved }) {
  const editorRef = useRef();
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(user.avatar && user.avatar.contentUrl);
  const [file, setFile] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const updateUser = UpdateUser();

  const onDrop = useCallback(acceptedFiles => {
    const [file] = acceptedFiles;
    setScale(1);
    setRotate(0);
    setFile(file);

    const reader = new FileReader();

    reader.onabort = () => {
      console.log('file reading was aborted');
    };
    reader.onerror = () => {
      console.log('file reading has failed');
    };
    reader.onload = () => {
      setImage(reader.result);
    };

    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    noClick: !!image,
    multiple: false,
    disabled: false,
    accept: 'image/jpeg, image/png',
    onDrop,
  });

  const hasNewAvatar = !!file || (!file && (rotate !== 0 || scale !== 1));

  return (
    <div className="role-editor">
      <div className="role-editor__content">
        <TextInput
          className="role-editor__name_input"
          label="Display Name"
          value={name}
          onChange={e => {
            setName(e.target.value);
          }}
        />

        <div className="role-editor__avatar-block">
          <h4 className="role-editor__avatar-block-title">Avatar Editor</h4>
          {/* The Dropzone. Note that we remove the input if an image is present so that when editor moves the image with DmD it doesn't open the file picker */}
          <div
            {...getRootProps()}
            className="role-editor__avatar-editor-dropzone"
          >
            <AvatarEditor
              className="role-editor__avatar-editor"
              ref={editorRef}
              image={image}
              width={150}
              height={150}
              border={25}
              borderRadius={75}
              scale={scale}
              rotate={rotate}
              /*style={{ width: '100%', height: '100%' }}*/
            />
            {!image && <input {...getInputProps()} />}
            {!image && (
              <MdPerson className="role-editor__avatar-placeholder-image" />
            )}
            <label
              htmlFor="role-editor-input"
              className="role-editor__avatar-block-label"
            >
              Drag and drop file or click to upload image.
            </label>
          </div>

          {/* Control to allow editors to open the file picker (and to replace the one on the canvas). Once a file is in the canvas clicking on the canvas does _not_ open the file picker so this is necessary  */}

          <input {...getInputProps()} id="role-editor-input" />

          {!!image && (
            <div className="role-editor__image-controls">
              <span className="role-editor__image-controls-label">
                Drag the image to select the part that you want part of your
                avatar
              </span>
              <div className="role-editor__input-row">
                <input
                  className="role-editor__scale-input"
                  type="range"
                  id="role-editor-scale"
                  name="scale"
                  min={1}
                  max={10}
                  step={0.1}
                  onChange={e => {
                    setScale(parseFloat(e.target.value));
                  }}
                  value={scale}
                />
                <label
                  className="role-editor__input-label role-editor__input-label--scale"
                  htmlFor="role-editor-scale"
                >
                  Zoom
                </label>
              </div>

              <div className="role-editor__input-row">
                <input
                  className="role-editor__rotate-input"
                  type="range"
                  id="role-editor-rotate"
                  name="scale"
                  min={-180}
                  max={180}
                  step={0}
                  onChange={e => {
                    setRotate(parseFloat(e.target.value));
                  }}
                  value={rotate}
                />
                <label
                  className="role-editor__input-label role-editor__input-label--rotate"
                  htmlFor="role-editor-scale"
                >
                  Rotate
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
      <Controls
        error={updateUser.error} // #FIXME
        className="role-editor__controls"
      >
        <Button
          disabled={updateUser.loading}
          onClick={() => {
            onCancel();
          }}
        >
          Cancel
        </Button>

        <Button
          isWaiting={updateUser.loading}
          disabled={(name === user.name && !hasNewAvatar) || updateUser.loading}
          primary={true}
          onClick={() => {
            const payload = {};
            if (user.name !== name) {
              payload.name = name;
            }
            if (hasNewAvatar) {
              const canvas = editorRef.current.getImage();

              // We need to keep the base64 string small to avoid hitting the
              // size limit on JSON documents for Cloudant
              let q = 0.92;
              let dataUrl = canvas.toDataURL('image/jpeg', q);
              while (dataUrl.length > 200000 && q > 0.1) {
                q -= 0.05;
                dataUrl = canvas.toDataURL('image/jpeg', q);
              }

              payload.avatar = {
                '@type': 'ImageObject',
                encodingFormat: file ? file.type : user.avatar.encodingFormat,
                contentUrl: dataUrl,
              };
            }

            updateUser(user, editor)
              .then(() => alert('User updated successfully.'))
              .catch(err => alert(`An error occurred: ${err}`));
            onSaved(user);
          }}
        >
          Save
        </Button>
      </Controls>
    </div>
  );
}

RoleEditor.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
  editor: PropTypes.object.isRequired,
  user: PropTypes.object,
};
