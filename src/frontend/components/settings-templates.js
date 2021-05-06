// base imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// material ui imports
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Modal from '@material-ui/core/Modal';
import MuiButton from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

// utils
import {
  useDeleteCommunityTemplates,
  useGetCommunityTemplates,
  usePostCommunityTemplates,
} from '../hooks/api-hooks.tsx';

// components
import EditTemplate from './edit-template';

// icons
import DeleteIcon from '@material-ui/icons/Delete';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

const Button = withStyles({
  root: {
    color: '#fff',
    textTransform: 'none',
  },
})(MuiButton);

const StyledTableRow = withStyles(theme => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const useStyles = makeStyles(theme => ({
  info: {
    backgroundColor: '#FAB7B7',
  },
  infoIcon: {
    paddingRight: 5,
  },
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

export default function Templates({ community }) {
  const classes = useStyles();

  // fetch all templates from the API
  const [templates, setTemplates] = useState(null);
  const {
    data: templatesData,
    loading: loading,
    error,
  } = useGetCommunityTemplates({
    cid: community.uuid,
  });

  // post new template via the API
  const { mutate: postTemplate } = usePostCommunityTemplates({
    cid: community.uuid,
  });

  // template content
  const [title, setTitle] = useState('');
  const [errorTitle, setErrorTitle] = useState(false);
  const [content, setContent] = useState('');

  const onContentChange = value => {
    setContent(value);
  };

  const onTitleChange = value => {
    setTitle(value);
  };

  const canSubmit = () => {
    if (!title) {
      setErrorTitle(true);
      return false;
    } else {
      setErrorTitle(false);
    }

    if (!content || content === '<p></p>') {
      alert('Template cannot be blank.');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (canSubmit()) {
      postTemplate({
        title: title,
        contents: content,
      })
        .then(response => {
          alert('Template updated successfully.');
          handleCloseAdd(response.data);
          return;
        })
        .catch(err => alert(`An error occurred: ${err.message}`));
    }
  };

  const resetContent = () => {
    setTitle('');
    setContent('');
  };

  // handle open and close of add template modal
  const [openAdd, setOpenAdd] = useState(false);

  const handleOpenAdd = () => {
    setOpenAdd(true);
  };

  const handleCloseAdd = template => {
    const newTemplates = [...templates, template];
    setTemplates(newTemplates);
    resetContent();
    setOpenAdd(false);
  };

  useEffect(() => {
    if (!loading && !templates) {
      if (templatesData) {
        setTemplates(templatesData.data);
      }
    }
  }, [templates, templatesData, title, content]);

  if (loading) {
    return <CircularProgress className={classes.spinning} />;
  } else {
    return (
      <>
        <Box my={2} p={2} className={classes.info}>
          <Typography component="div" variant="body1">
            <InfoOutlinedIcon className={classes.infoIcon} />
            Review templates are guides a user can choose from when starting
            their full PREreview.
          </Typography>
        </Box>
        <Button
          onClick={handleOpenAdd}
          type="button"
          variant="contained"
          color="primary"
        >
          Add a template
        </Button>
        <Modal
          open={openAdd}
          onClose={handleCloseAdd}
          aria-label="add template modal"
        >
          <div className={classes.paper}>
            <Typography variant="h5" component="h2" gutterBottom>
              Add a template
            </Typography>
            <TextField
              id="template-title"
              label="Title"
              variant="outlined"
              placeholder="Add a name for this template"
              className={classes.input}
              error={errorTitle}
              onChange={() => onTitleChange(event.target.value)}
              helperText={error ? 'This field is required' : null}
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
              onChange={event => onContentChange(event.target.value)}
              required
            />
            {/*
            <TemplateEditor
              id={'add'}
              initialContent={content}
              handleContentChange={onContentChange}
            />
            */}
            <Button
              onClick={handleSubmit}
              type="button"
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Submit
            </Button>
          </div>
        </Modal>
        <Box my={4}>
          <TableContainer>
            <Table className={classes.table} aria-label="templates table">
              <TableHead>
                <TableRow>
                  <TableCell className="vh">Name</TableCell>
                  <TableCell className="vh">Edit</TableCell>
                  <TableCell className="vh">Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates &&
                  templates.map(template => (
                    <SettingsRow
                      key={template.uuid}
                      template={template}
                      community={community}
                      onDelete={() => {
                        setTemplates(
                          templates.filter(t => t.uuid !== template.uuid),
                        );
                      }}
                    />
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </>
    );
  }
}

function SettingsRow({ template, community, onDelete }) {
  // template content
  const [title, setTitle] = useState(template.title);
  const [content, setContent] = useState(template.content);

  // delete template from the database
  const { mutate: deleteTemplate } = useDeleteCommunityTemplates({
    queryParams: {
      id: template.uuid,
    },
    cid: community.uuid,
  });

  return (
    <StyledTableRow key={template.uuid}>
      <TableCell component="th" scope="row">
        {template.title}
      </TableCell>
      <TableCell>
        <EditTemplate
          title={title}
          content={content}
          template={template}
          handleTitleChange={newTitle => setTitle(newTitle)}
          handleContentChange={newContent => setContent(newContent)}
        />
      </TableCell>
      <TableCell>
        <IconButton
          onClick={() => {
            if (confirm('Are you sure you want to delete this template?')) {
              deleteTemplate()
                .then(() => {
                  onDelete();
                  alert('Template deleted successfully.');
                  return;
                })
                .catch(err => alert(`An error occurred: ${err.message}`));
            }
          }}
          type="button"
        >
          <Typography variant="srOnly">{`Delete ${title}`}</Typography>
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </StyledTableRow>
  );
}

SettingsRow.propTypes = {
  community: PropTypes.object,
  template: PropTypes.object,
  onDelete: PropTypes.func,
};
