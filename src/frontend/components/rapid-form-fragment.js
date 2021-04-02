// base imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';

// MaterialUI components
import { makeStyles, withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

// components
import YesNoQuestion from './yes-no-question';

// icons
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

// constants
import { QUESTIONS } from '../constants';

const StyledTableCell = withStyles(() => ({
  root: {
    borderBottom: 'none',
  },
}))(TableCell);

const StyledTableRow = withStyles(theme => ({
  root: {
    borderBottom: 'none',
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:last-child': {
      backgroundColor: '#fff',
    },
  },
}))(TableRow);

const useStyles = makeStyles({
  absolute: {
    left: 0,
    minWidth: 300,
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  help: {
    position: 'absolute',
    right: '-40px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  question: {
    position: 'relative',
  },
  relative: {
    position: 'relative',
  },
  table: {
    borderBottom: 'none',
  },
  textAnswer: {
    // display: 'inline-block',
  },
});

export default function RapidFormFragment({ answerMap = {}, onChange }) {
  const classes = useStyles();
  const [textValue, setTextValue] = useState('');

  const [isOpenedMap, setIsOpenedMap] = useState(
    QUESTIONS.filter(q => q.type == 'YesNoQuestion').reduce((map, q) => {
      map[q.identifier] = false;
      return map;
    }, {}),
  );

  return (
    <TableContainer>
      <Table
        stickyHeader
        className={classes.table}
        aria-label="questions table"
      >
        <TableHead>
          <TableRow>
            <StyledTableCell>
              <Typography variant="srOnly">Question</Typography>
            </StyledTableCell>
            <StyledTableCell align="right">
              <Typography component="div" variant="body1">
                Yes
              </Typography>
            </StyledTableCell>
            <StyledTableCell align="center">
              <Typography component="div" variant="body1">
                No
              </Typography>
            </StyledTableCell>
            <StyledTableCell align="center">
              <Typography component="div" variant="body1">
                N/A
              </Typography>
            </StyledTableCell>
            <StyledTableCell align="center">
              <Typography component="div" variant="body1">
                Unsure
              </Typography>
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {QUESTIONS.map(({ type, identifier, question, help, required }) => {
            const answer = answerMap[identifier];
            return type == 'YesNoQuestion' ? (
              <StyledTableRow key={identifier}>
                <YesNoQuestion
                  identifier={identifier}
                  question={question}
                  help={help}
                  required={required}
                  onChange={onChange}
                />
              </StyledTableRow>
            ) : (
              <StyledTableRow key={identifier} className={classes.textAnswer}>
                <StyledTableCell
                  component="th"
                  scope="row"
                  className="radid-form-fragment__question"
                >
                  <Typography component="p" variant="body1">
                    {question}
                  </Typography>

                  {!!help && (
                    <IconButton
                      className="radid-form-fragment__help"
                      onClick={e => {
                        e.preventDefault();
                        setIsOpenedMap(
                          Object.assign({}, isOpenedMap, {
                            [identifier]: !isOpenedMap[identifier],
                          }),
                        );
                      }}
                    >
                      <HelpOutlineIcon />
                    </IconButton>
                  )}
                </StyledTableCell>
                <StyledTableCell align="right" className={classes.relative}>
                  <TextField
                    fullWidth
                    className={classes.absolute}
                    id={`question-${identifier}`}
                    name={identifier}
                    value={textValue || ''}
                    variant="outlined"
                    required={required}
                    onChange={event => {
                      setTextValue(event.target.value);
                      onChange(identifier, event.target.value);
                    }}
                  />
                </StyledTableCell>
              </StyledTableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

RapidFormFragment.propTypes = {
  onChange: PropTypes.func.isRequired,
  answerMap: PropTypes.object,
};
