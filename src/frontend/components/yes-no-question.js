// base imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';

// MaterialUI components
import { makeStyles, withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Radio from '@material-ui/core/Radio';
import TableCell from '@material-ui/core/TableCell';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

// icons
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

const StyledTableCell = withStyles(() => ({
  root: {
    borderBottom: 'none',
  },
}))(TableCell);

const useStyles = makeStyles({
  help: {
    position: 'absolute',
    right: '-40px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  question: {
    position: 'relative',
  },
});

export default function YesNoQuestion({
  identifier,
  question,
  help,
  required,
  onChange,
}) {
  const classes = useStyles();
  const [selectedValue, setSelectedValue] = useState({});

  const handleChange = (event, value) => {
    console.log(event.target);
    setSelectedValue(event.target.value);
    onChange(event.target.value, value);
  };

  return (
    <>
      <StyledTableCell component="th" scope="row">
        <Typography
          component="div"
          variant="body1"
          className={classes.question}
        >
          {question}
          {help && (
            <Tooltip
              className={classes.help}
              title={
                <Typography component="p" variant="body1">
                  {help}
                </Typography>
              }
            >
              <IconButton aria-label="delete">
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          )}
        </Typography>
      </StyledTableCell>
      <StyledTableCell align="right">
        <Radio
          required={required}
          id={`question-${identifier}-yes`}
          checked={selectedValue === 'yes'}
          onChange={handleChange}
          value="yes"
          label="Yes"
          name={identifier}
          inputProps={{ 'aria-label': 'Yes' }}
        />
      </StyledTableCell>
      <StyledTableCell align="right">
        <Radio
          required={required}
          id={`question-${identifier}-no`}
          checked={selectedValue === 'no'}
          onChange={handleChange}
          value="no"
          label="No"
          name={identifier}
          inputProps={{ 'aria-label': 'No' }}
        />
      </StyledTableCell>
      <StyledTableCell align="right">
        <Radio
          required={required}
          id={`question-${identifier}-na`}
          checked={selectedValue === 'N/A'}
          onChange={handleChange}
          value="N/A"
          label="N/A"
          name={identifier}
          inputProps={{ 'aria-label': 'N/A' }}
        />
      </StyledTableCell>
      <StyledTableCell align="right">
        <Radio
          required={required}
          id={`question-${identifier}-unsure`}
          checked={selectedValue === 'unsure'}
          onChange={handleChange}
          value="unsure"
          label="Unsure"
          name={identifier}
          inputProps={{ 'aria-label': 'Unsure' }}
        />
      </StyledTableCell>
    </>
  );
}

YesNoQuestion.propTypes = {
  identifier: PropTypes.string,
  question: PropTypes.string.isRequired,
  help: PropTypes.string,
  required: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};
