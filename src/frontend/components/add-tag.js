// base imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// material ui imports
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import MuiButton from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

// hooks
import { usePostCommunityTag } from '../hooks/api-hooks.tsx';

// icons
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

const Button = withStyles({
  root: {
    textTransform: 'none',
  },
})(MuiButton);

const useStyles = makeStyles(theme => ({
  buttonText: {
    paddingLeft: 6,
  },
  checkedField: {
    display: 'block',
    marginBottom: '1rem',
  },
  dateField: {
    display: 'block',
    marginBottom: '1rem',
  },
  paper: {
    top: `50%`,
    left: `50%`,
    transform: `translate(-50%, -50%)`,
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  spinning: {
    color: '#ff3333',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  textField: {
    marginBottom: '1rem',
    width: '100%',
  },
}));

const AddEvent = ({ community }) => {
  const classes = useStyles();

  const [inputs, setInputs] = useState({});

  /* API calls */
  const { mutate: addCommunityTag } = usePostCommunityTag({
    id: community,
    tid: 'none',
  });

  /* update inputs with new values */
  const handleInputChange = event => {
    event.persist();
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }));
  };

  const handleAddTag = () => {
    addCommunityTag(inputs)
      .then(response => {
        console.log(response);
        handleClose();
        alert(`Tag added successfully.`);
        return;
      })
      .catch(err => alert(`An error occurred: ${err.message}`));
  };

  // getModalStyle is not a pure function, we roll the style only on the first render
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [disabledSubmit, setDisabledSubmit] = useState(true);

  useEffect(() => {
    inputs.name && inputs.name.length
      ? setDisabledSubmit(false)
      : setDisabledSubmit(true);
  }, [inputs]);

  return (
    <div>
      <Button type="button" onClick={handleOpen}>
        <AddCircleOutlineIcon />
        <span className={classes.buttonText}>Add new tag</span>
      </Button>
      <Modal open={open} onClose={handleClose} aria-labelledby="add-tag-title">
        <div className={classes.paper}>
          <form>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom={true}
              id="add-tag-title"
            >
              Add a tag
            </Typography>
            <TextField
              required
              id="name"
              name="name"
              label="Name"
              variant="outlined"
              className={classes.textField}
              onChange={handleInputChange}
            />
            <Button
              disabled={disabledSubmit}
              variant="contained"
              color="primary"
              type="button"
              onClick={handleAddTag}
            >
              Submit
            </Button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

AddEvent.propTypes = {
  community: PropTypes.string,
};

export default AddEvent;
