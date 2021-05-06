// base imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import isURL from 'validator/lib/isURL';

// material ui imports
import { makeStyles, withStyles } from '@material-ui/core/styles';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
  KeyboardTimePicker,
  DateTimePicker,
} from '@material-ui/pickers';
import Checkbox from '@material-ui/core/Checkbox';
import DateFnsUtils from '@date-io/date-fns';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Modal from '@material-ui/core/Modal';
import MuiButton from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

// hooks
import { usePostCommunityEvent } from '../hooks/api-hooks.tsx';

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

const AddEvent = ({ community, addEvent }) => {
  const classes = useStyles();

  const [inputs, setInputs] = useState({});

  /* API calls */
  const { mutate: addCommunityEvent } = usePostCommunityEvent({
    id: community,
    eid: 'none',
  });

  /* update inputs with new values */
  const handleInputChange = event => {
    event.persist();
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }));
  };

  // special case for checkbox
  const handleCheckedChange = event => {
    event.persist();
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.checked,
    }));
  };

  /* Date picker */
  const [selectedStart, setSelectedStart] = React.useState(null);
  const [selectedEnd, setSelectedEnd] = React.useState(null);

  const handleStartChange = date => {
    setSelectedStart(date);
    setInputs(inputs => ({
      ...inputs,
      start: date,
    }));
  };

  const handleEndChange = date => {
    setSelectedEnd(date);
    setInputs(inputs => ({
      ...inputs,
      end: date,
    }));
  };

  /* validation */
  const canSubmit = () => {
    if (inputs.title && inputs.description && inputs.start) {
      if (inputs.url && !isURL(inputs.url)) {
        alert('The event link must be a valid URL.');
        return false;
      }
      return true;
    } else {
      alert('Please fill out required fields.');
      return false;
    }
  };

  const handleAddEvent = () => {
    if (canSubmit()) {
      addCommunityEvent(inputs)
        .then(resp => {
          addEvent({ ...inputs, uuid: resp.data.uuid });
          handleClose();
        })
        .then(() => {
          alert(`Event added successfully.`);
          return;
        })
        .catch(err => alert(`An error occurred: ${err.message}`));
    }
  };

  // getModalStyle is not a pure function, we roll the style only on the first render
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button type="button" onClick={handleOpen}>
        <AddCircleOutlineIcon />
        <span className={classes.buttonText}>Add new event</span>
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="add-event-title"
      >
        <div className={classes.paper}>
          <form>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom={true}
              id="add-event-title"
            >
              Add an event
            </Typography>
            <TextField
              required
              id="title"
              name="title"
              label="Title"
              variant="outlined"
              className={classes.textField}
              onChange={handleInputChange}
            />
            <TextField
              required
              id="description"
              name="description"
              label="Description"
              variant="outlined"
              multiline
              rows={4}
              className={classes.textField}
              onChange={handleInputChange}
            />
            <TextField
              id="url"
              name="url"
              label="Link"
              variant="outlined"
              className={classes.textField}
              onChange={handleInputChange}
            />
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DateTimePicker
                required
                autoOk
                margin="normal"
                id="start"
                name="start"
                label="Start"
                inputformat="yyyy/MM/dd hh:mm a"
                value={selectedStart}
                className={classes.dateField}
                onChange={handleStartChange}
                keyboardbuttonprops={{
                  'aria-label': 'change date',
                }}
              />
            </MuiPickersUtilsProvider>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DateTimePicker
                autoOk
                margin="normal"
                id="end"
                name="end"
                label="End"
                inputformat="yyyy/MM/dd hh:mm a"
                value={selectedEnd}
                className={classes.dateField}
                onChange={handleEndChange}
                keyboardbuttonprops={{
                  'aria-label': 'change date',
                }}
              />
            </MuiPickersUtilsProvider>
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  checked={inputs.isPrivate || false}
                  onChange={handleCheckedChange}
                  name="isPrivate"
                />
              }
              label="Check the box if this is a private event."
              className={classes.checkedField}
            />
            <Button
              variant="contained"
              color="primary"
              type="button"
              onClick={handleAddEvent}
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
  addEvent: PropTypes.func,
};

export default AddEvent;
