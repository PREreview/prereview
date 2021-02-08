// base imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';

// material UI imports
import { makeStyles, withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Modal from '@material-ui/core/Modal';
import MuiButton from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

// utils
import { usePutTemplate } from '../hooks/api-hooks.tsx';

// components
import TemplateEditor from './template-editor';

//icons
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';

const Button = withStyles({
  root: {
    color: '#fff',
    textTransform: 'none',
  },
})(MuiButton);

const useStyles = makeStyles(theme => ({
  input: {
    marginBottom: '1rem',
    width: '100%',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    top: `50%`,
    left: `50%`,
    maxWidth: 750,
    padding: theme.spacing(2, 4, 3),
    position: 'absolute',
    transform: `translate(-50%, -50%)`,
    width: '80vw',
  },
  spinning: {
    color: '#ff3333',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  submit: {
    marginTop: '1rem',
  },
}));

const EditTemplate = ({
  template,
  title,
  content,
  handleContentChange,
  handleTitleChange,
  resetContent,
}) => {
  const classes = useStyles();

  // update templates by sending data through the API
  const { mutate: putTemplate } = usePutTemplate({ id: template.uuid });

  // handle open and close of edit template modal
  const [openEdit, setOpenEdit] = useState(false);

  const [contents, setContents] = useState(template.contents);

  const handleOpenEdit = () => {
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    if (resetContent) {
      resetContent();
    }
    setOpenEdit(false);
  };

  // check if submittable content or if errors
  const [error, setError] = useState(false);

  const canSubmit = () => {
    if (!title && !template.title) {
      setError(true);
      return false;
    } else {
      setError(false);
    }

    if (
      (!content && !template.contents) ||
      (content === '<p></p>' && !template.contents)
    ) {
      alert('Template cannot be blank.');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (canSubmit()) {
      putTemplate({
        title: title ? title : template.title,
        contents: content ? content : template.contents,
      })
        .then(() => {
          alert('Template updated successfully.');
          handleCloseEdit();
          return;
        })
        .catch(err => alert(`An error occurred: ${err.message}`));
    }
  };

  return (
    <>
      <IconButton onClick={handleOpenEdit} type="button">
        <div className="vh">{`Edit ${template.title}`}</div>
        <EditOutlinedIcon />
      </IconButton>
      <Modal
        open={openEdit}
        onClose={handleCloseEdit}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className={classes.paper}>
          <Typography variant="h5" component="h2" gutterBottom>
            Edit template
          </Typography>
          <TextField
            id="template-title"
            label="Title"
            variant="outlined"
            placeholder="Add a name for this template"
            className={classes.input}
            error={error}
            defaultValue={template.title}
            onChange={event => handleTitleChange(event.target.value)}
            required
          />
          <TextField
            id="template-content"
            variant="outlined"
            placeholder="Add contents for this template"
            multiline
            rows={4}
            className={classes.input}
            error={error}
            defaultValue={contents}
            onChange={event => {
              setContents(event.target.value);
              handleContentChange(event.target.value);
            }}
            required
          />
          {/*
          <TemplateEditor
            id={template.uuid}
            initialContent={template.contents}
            handleContentChange={handleContentChange}
          />
          */}
          <Button
            onClick={() => handleSubmit(template.id)}
            type="button"
            variant="contained"
            color="secondary"
            className={classes.submit}
          >
            Submit
          </Button>
        </div>
      </Modal>
    </>
  );
};

EditTemplate.propTypes = {
  template: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  handleContentChange: PropTypes.func.isRequired,
  handleTitleChange: PropTypes.func.isRequired,
  resetContent: PropTypes.func,
};

export default EditTemplate;
