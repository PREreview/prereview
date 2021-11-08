// base imports
import React, { useCallback, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import AvatarEditor from 'react-avatar-editor';
import { useDropzone } from 'react-dropzone';

// hooks
import { usePutPersona } from '../hooks/api-hooks.tsx';

// MaterialUI imports
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import MuiButton from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

// icons
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

const Button = withStyles({
  root: {
    textTransform: 'none',
  },
})(MuiButton);

const useStyles = makeStyles(() => ({
  label: {
    display: 'block',
  },
  title: {
    marginBottom: 20,
  },
}));

export default function RoleEditor({ persona, onCancel, onSaved }) {
  const classes = useStyles();
  const editorRef = useRef();
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const { mutate: updatePersona, loading } = usePutPersona({
    id: persona.uuid,
  });

  const dataUrlToFile = async dataURL => {
    const blob = await (await fetch(dataURL)).blob();
    return new File([blob], 'fileName.jpg', {
      type: 'image/jpeg',
      lastModified: new Date(),
    });
  };

  useEffect(() => {
    const ac = new AbortController();
    if (persona && persona.avatar) {
      dataUrlToFile(persona.avatar)
        .then(file => setImage(file))
        .catch(err => alert(`An error occurred: ${err.message}`));
    }
    return () => ac.abort();
  }, [persona]);

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
    <>
      <Typography variant="h4" component="h1" className={classes.title}>
        Avatar Editor
      </Typography>
      <div {...getRootProps()}>
        <AvatarEditor
          ref={editorRef}
          image={image}
          width={250}
          height={250}
          border={25}
          borderRadius={150}
          scale={scale}
          rotate={rotate}
        />
        {!image && <input {...getInputProps()} />}
        {!image && <AccountCircleIcon />}
        <Typography
          className={classes.label}
          component="label"
          variant="body1"
          htmlFor="role-editor-input"
        >
          Drag and drop file or click to upload image.
        </Typography>
      </div>
      {/* Control to allow editors to open the file picker (and to replace the one on the canvas). Once a file is in the canvas clicking on the canvas does _not_ open the file picker so this is necessary  */}

      <input {...getInputProps()} id="role-editor-input" />
      {!!image && (
        <>
          <Typography variant="body1" component="span">
            Then drag the image to select the part of your avatar that you want
            to display.
          </Typography>
          <Box my={2}>
            <Box mb={1}>
              <Grid
                container
                spacing="2"
                alignItems="flex-start"
                justify="flex-start"
              >
                <Grid item>
                  <input
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
                </Grid>
                <Grid item>
                  <Typography
                    component="label"
                    variant="body1"
                    htmlFor="role-editor-scale"
                  >
                    Zoom
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            <Grid
              container
              spacing="2"
              alignItems="flex-start"
              justify="flex-start"
            >
              <Grid item>
                <input
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
              </Grid>
              <Grid item>
                <Typography
                  component="label"
                  variant="body1"
                  htmlFor="role-editor-scale"
                >
                  Rotate
                </Typography>
              </Grid>
            </Grid>
          </Box>
          <div>
            <Button
              color="primary"
              isWaiting={loading}
              disabled={(name === persona.name && !hasNewAvatar) || loading}
              primary={true}
              onClick={() => {
                const data = {};
                if (hasNewAvatar) {
                  const canvas = editorRef.current.getImageScaledToCanvas();

                  // We need to keep the base64 string small to avoid hitting the
                  // size limit on JSON documents for Cloudant
                  let q = 0.92;
                  let dataUrl = canvas.toDataURL('image/jpeg', q);
                  while (dataUrl.length > 200000 && q > 0.1) {
                    q -= 0.05;
                    dataUrl = canvas.toDataURL('image/jpeg', q);
                  }
                  data.avatar = dataUrl;
                }

                updatePersona(data)
                  .then(resp => {
                    let updatedPersona = resp.data;
                    alert('Persona updated successfully.');
                    return onSaved(updatedPersona);
                  })
                  .catch(err => alert(`An error occurred: ${err.message}`));
              }}
            >
              Save
            </Button>
            <Button
              color="primary"
              disabled={loading}
              onClick={() => {
                onCancel();
              }}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </>
  );
}

RoleEditor.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
  persona: PropTypes.object,
};
